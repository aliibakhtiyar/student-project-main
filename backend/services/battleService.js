const grok = require('../config/grok');
const Battle = require('../models/Battle');
const MODEL = process.env.GROK_CHAT_MODEL || 'grok-4.7';

async function generateBattleQuestions({ topic, difficulty, count }) {
  const response = await grok.chat.completions.create({
    model: MODEL,
    temperature: 0.25,
    max_completion_tokens: 4500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `Generate accurate programming and CS MCQs as JSON only: {"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]}. Exactly the requested number of questions; exactly four distinct options per question; correctAnswer integer 0-3. No markdown. Avoid ambiguous questions.` },
      { role: 'user', content: JSON.stringify({ topic, difficulty, count }) },
    ],
  });
  const raw = response.choices?.[0]?.message?.content || '';
  const questions = JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')).questions;
  if (!Array.isArray(questions) || questions.length !== count || questions.some(q =>
    !q || typeof q.question !== 'string' || !q.question.trim() || q.question.length > 1000 ||
    !Array.isArray(q.options) || q.options.length !== 4 ||
    q.options.some(o => typeof o !== 'string' || !o.trim() || o.length > 350) ||
    new Set(q.options.map(o => o.toLowerCase().trim())).size !== 4 ||
    !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3 ||
    typeof q.explanation !== 'string'
  )) throw new Error('Grok returned an invalid battle question set');
  return questions;
}

function battleForViewer(battle, viewerId) {
  const b = battle.toObject ? battle.toObject() : battle;
  const self = String(viewerId);
  const result = {
    id: String(b._id), topic: b.topic, difficulty: b.difficulty,
    challenger: String(b.challenger._id || b.challenger),
    opponent: String(b.opponent._id || b.opponent),
    challengerName: b.challenger.name || '', opponentName: b.opponent.name || '',
    status: b.status, durationSeconds: b.durationSeconds,
    startsAt: b.startsAt, endsAt: b.endsAt, createdAt: b.createdAt,
    inviteExpiresAt: b.inviteExpiresAt, questionCount: b.questions.length,
    submitted: b.submissions.some(s => String(s.user) === self),
    submissions: b.submissions.map(s => ({
      user: String(s.user), score: s.score, submittedAt: s.submittedAt,
    })),
  };
  if (b.status === 'active' || b.status === 'finished') result.questions = b.questions.map((q, id) => ({
    id, question: q.question, options: q.options,
    ...(b.status === 'finished' ? { correctAnswer: q.correctAnswer, explanation: q.explanation } : {}),
  }));
  if (b.status === 'finished') result.winner = b.winner ? String(b.winner) : null;
  return result;
}

async function finishIfReady(battle, io) {
  if (battle.status === 'pending' && new Date(battle.inviteExpiresAt).getTime() <= Date.now()) {
    await Battle.updateOne({ _id: battle._id, status: 'pending' }, { $set: { status: 'expired' } });
    battle.status = 'expired';
  }
  if (battle.status !== 'active') return battle;
  if (battle.submissions.length !== 2 && new Date(battle.endsAt).getTime() > Date.now()) return battle;
  const left = battle.submissions.find(s => String(s.user) === String(battle.challenger));
  const right = battle.submissions.find(s => String(s.user) === String(battle.opponent));
  const leftScore = left?.score || 0, rightScore = right?.score || 0;
  let winner = null;
  if (leftScore > rightScore) winner = battle.challenger;
  else if (rightScore > leftScore) winner = battle.opponent;
  else if (left && right && leftScore > 0) {
    if (new Date(left.submittedAt) < new Date(right.submittedAt)) winner = battle.challenger;
    else if (new Date(right.submittedAt) < new Date(left.submittedAt)) winner = battle.opponent;
  } else if (left && !right && leftScore > 0) winner = battle.challenger;
  else if (right && !left && rightScore > 0) winner = battle.opponent;
  const updated = await Battle.findOneAndUpdate({ _id: battle._id, status: 'active' },
    { $set: { status: 'finished', winner } }, { new: true });
  if (updated) {
    io?.to(`user:${battle.challenger}`).to(`user:${battle.opponent}`).emit('battle:update', { id: String(battle._id) });
    return updated;
  }
  return await Battle.findById(battle._id);
}
async function sweepExpired(io) {
  try {
    const now = new Date();
    await Battle.updateMany({ status: 'pending', inviteExpiresAt: { $lte: now } },
      { $set: { status: 'expired' } });
    const expired = await Battle.find({ status: 'active', endsAt: { $lte: now } }).limit(100);
    for (const b of expired) await finishIfReady(b, io);
  } catch (error) { console.error('Match settlement:', error.message); }
}
module.exports = { generateBattleQuestions, battleForViewer, finishIfReady, sweepExpired };
