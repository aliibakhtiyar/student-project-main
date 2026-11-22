const grok = require('../config/grok');
const Battle = require('../models/Battle');
const MODEL = process.env.GROK_CHAT_MODEL || 'grok-4.7';

// Grok can spend completion tokens on reasoning. Retry only malformed/truncated
// outputs; never retry billing, auth, rate-limit or network failures automatically.
function parseQuestionSet(raw, count) {
  if (!raw || typeof raw !== 'string') throw new Error('Grok returned no questions');
  let data;
  try {
    data = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  } catch {
    throw new Error('Grok returned text that was not valid question JSON');
  }
  const questions = data?.questions;
  if (!Array.isArray(questions) || questions.length !== count) {
    throw new Error('Grok returned the wrong number of questions');
  }
  if (questions.some(q =>
    !q || typeof q.question !== 'string' || !q.question.trim() || q.question.length > 1000 ||
    !Array.isArray(q.options) || q.options.length !== 4 ||
    q.options.some(o => typeof o !== 'string' || !o.trim() || o.length > 350) ||
    new Set(q.options.map(o => o.toLowerCase().trim())).size !== 4 ||
    !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3 ||
    typeof q.explanation !== 'string'
  )) {
    throw new Error('Grok returned questions with invalid options, answers or explanations');
  }
  return questions;
}

async function generateBattleQuestions({ topic, difficulty, count }) {
  const messages = [
    { role: 'system', content: 'Generate accurate computer-science multiple-choice questions. Return only one valid JSON object with a "questions" array. Each question must have question (string), options (array of exactly four distinct strings), correctAnswer (integer 0-3), and explanation (string). No Markdown. Exactly the requested count. Ensure only one option is correct. Keep questions and explanations brief.' },
    { role: 'user', content: JSON.stringify({ topic, difficulty, count }) },
  ];
  for (let attempt = 0; attempt < 2; attempt++) {
    // 10-question battles need more budget than 5-question battles.
    const maxTokens = count === 10 ? 12000 : 7000;
    const response = await grok.chat.completions.create({
      model: MODEL,
      max_completion_tokens: maxTokens,
      // Response-format hints are omitted for maximum compatibility with Grok models.
      messages: attempt === 0 ? messages : [
        ...messages,
        { role: 'user', content: 'Your previous response could not be validated. Return strict JSON with exactly the specified number of complete questions. Do not add any other text.' },
      ],
    });
    try {
      return parseQuestionSet(response.choices?.[0]?.message?.content, count);
    } catch (err) {
      console.warn('[PvP question validation]', {
        attempt: attempt + 1,
        reason: err.message,
        finishReason: response.choices?.[0]?.finish_reason || null,
      });
      if (attempt === 1) {
        const failure = new Error('Grok could not generate a complete valid question set. Try 5 questions or a simpler topic.');
        failure.status = 502;
        failure.code = 'GROK_INVALID_QUESTIONS';
        throw failure;
      }
    }
  }
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
