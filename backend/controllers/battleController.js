const mongoose = require('mongoose');
const Battle = require('../models/Battle');
const Friendship = require('../models/Friendship');
const { generateBattleQuestions, battleForViewer, finishIfReady } = require('../services/battleService');

function isParticipant(battle, id) {
  return String(battle.challenger._id || battle.challenger) === String(id) ||
    String(battle.opponent._id || battle.opponent) === String(id);
}
const emit = (req, battle) => req.app.get('io')?.to(`user:${battle.challenger}`).to(`user:${battle.opponent}`)
  .emit('battle:update', { id: String(battle._id) });
async function challenge(req, res) {
  const { opponentId, topic, difficulty = 'Medium', count = 5 } = req.body;
  const id = String(opponentId || '');
  const normalizedTopic = String(topic || '').trim();
  if (!mongoose.isValidObjectId(id) || id === String(req.user._id) ||
    !normalizedTopic || normalizedTopic.length > 80 ||
    !['Easy','Medium','Hard'].includes(difficulty) || ![5, 10].includes(Number(count))) {
    return res.status(400).json({ message: 'Choose a friend, topic, difficulty, and 5 or 10 questions' });
  }
  try {
    const pairKey = [String(req.user._id), id].sort().join(':');
    if (!await Friendship.exists({ pairKey, status: 'accepted' })) {
      return res.status(403).json({ message: 'You can only challenge accepted friends' });
    }
    const pending = await Battle.countDocuments({ challenger: req.user._id, status: 'pending' });
    if (pending >= 5) return res.status(429).json({ message: 'Resolve your pending challenges first' });
    let questions;
    try {
      questions = await generateBattleQuestions({ topic: normalizedTopic, difficulty, count: Number(count) });
    } catch (error) {
      console.error('PvP challenge question generation:', {
        code: error.code || 'UNKNOWN',
        status: error.status || 502,
        message: error.message,
      });
      const safeStatus = [429, 502, 503, 504].includes(error.status) ? error.status : 502;
      const safeCodes = new Set([
        'AI_NOT_CONFIGURED', 'AI_INVALID_KEY', 'AI_NO_CREDITS',
        'AI_ACCESS_DENIED', 'AI_MODEL_UNAVAILABLE', 'AI_RATE_LIMIT',
        'AI_TIMEOUT', 'AI_NETWORK_ERROR', 'AI_INVALID_REQUEST',
        'AI_REQUEST_TOO_LARGE', 'AI_INVALID_QUESTIONS', 'AI_UPSTREAM_ERROR',
      ]);
      return res.status(safeStatus).json({
        message: safeCodes.has(error.code)
          ? error.message
          : 'Could not generate valid PvP questions. Please try again.',
        code: safeCodes.has(error.code) ? error.code : 'AI_GENERATION_FAILED',
      });
    }
    const battle = await Battle.create({
      challenger: req.user._id, opponent: id, topic: normalizedTopic, difficulty,
      durationSeconds: Number(count) === 10 ? 900 : 600, questions,
      inviteExpiresAt: new Date(Date.now() + 24*60*60*1000),
    });
    emit(req, battle);
    res.status(201).json({ battle: battleForViewer(battle, req.user._id) });
  } catch (e) {
    console.error('Save PvP challenge:', e.message);
    res.status(500).json({ message: 'Questions were generated, but the challenge could not be saved. Try again.', code: 'BATTLE_SAVE_FAILED' });
  }
}
async function list(req, res) {
  try {
    const battles = await Battle.find({ $or: [{ challenger: req.user._id }, { opponent: req.user._id }] })
      .select('-questions.correctAnswer -questions.explanation')
      .populate('challenger', 'name').populate('opponent', 'name')
      .sort({ createdAt: -1 }).limit(70);
    const now = Date.now();
    res.json({ battles: battles.map(b => {
      const view = battleForViewer(b, req.user._id);
      delete view.questions;
      if (b.status === 'active' && new Date(b.endsAt).getTime() < now) view.status = 'finished';
      if (b.status === 'pending' && new Date(b.inviteExpiresAt).getTime() < now) view.status = 'expired';
      return view;
    }) });
  } catch (e) { console.error('List battles:',e.message); res.status(500).json({ message: 'Could not load battles' }); }
}
async function get(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid match' });
    let b = await Battle.findById(req.params.id);
    if (!b || !isParticipant(b, req.user._id)) return res.status(404).json({ message: 'Battle not found' });
    b = await finishIfReady(b, req.app.get('io'));
    b = await Battle.populate(b, [{ path: 'challenger', select: 'name' }, { path: 'opponent', select: 'name' }]);
    res.json({ battle: battleForViewer(b, req.user._id) });
  } catch (e) { console.error('Read battle:',e.message); res.status(500).json({ message: 'Could not load battle' }); }
}
async function accept(req, res) {
  try {
    const start = new Date();
    const battle = await Battle.findOneAndUpdate({ _id: req.params.id, opponent: req.user._id,
      status: 'pending', inviteExpiresAt: { $gt: start } },
      { $set: { status: 'active', startsAt: start, endsAt: new Date(start.getTime() + 900000) } },
      { new: true });
    if (!battle) return res.status(409).json({ message: 'Invite is unavailable or has expired' });
    // For 5-question battles, use 10 minutes; 10 questions use 15.
    if (battle.durationSeconds === 600) { battle.endsAt = new Date(start.getTime() + 600000); await battle.save(); }
    emit(req, battle);
    res.json({ message: 'Challenge accepted' });
  } catch (e) { res.status(400).json({ message: 'Could not accept challenge' }); }
}
async function decline(req, res) {
  try {
    const battle = await Battle.findOneAndUpdate({ _id: req.params.id, opponent: req.user._id, status: 'pending' },
      { $set: { status: 'declined' } }, { new: true });
    if (!battle) return res.status(409).json({ message: 'Invite is not pending' });
    emit(req, battle);
    res.json({ message: 'Challenge declined' });
  } catch (e) { res.status(400).json({ message: 'Could not decline challenge' }); }
}
async function submit(req, res) {
  try {
    const answers = req.body.answers;
    if (!mongoose.isValidObjectId(req.params.id) || !Array.isArray(answers) ||
      answers.some(a => !Number.isInteger(a) || a < 0 || a > 3)) {
      return res.status(400).json({ message: 'Invalid answers' });
    }
    let battle = await Battle.findById(req.params.id);
    if (!battle || !isParticipant(battle, req.user._id)) return res.status(404).json({ message: 'Battle not found' });
    battle = await finishIfReady(battle, req.app.get('io'));
    if (battle.status !== 'active' || Date.now() >= new Date(battle.endsAt).getTime())
      return res.status(409).json({ message: 'Battle has ended' });
    if (answers.length !== battle.questions.length) return res.status(400).json({ message: 'Answer every question before submitting' });
    const score = answers.filter((a,i) => a === battle.questions[i].correctAnswer).length;
    // Atomic write: protects against duplicate submissions from multiple browser tabs.
    const updated = await Battle.findOneAndUpdate({ _id: battle._id, status: 'active',
      endsAt: { $gt: new Date() }, 'submissions.user': { $ne: req.user._id } },
      { $push: { submissions: { user: req.user._id, answers, score, submittedAt: new Date() } } },
      { new: true });
    if (!updated) return res.status(409).json({ message: 'You already submitted or the battle ended' });
    emit(req, updated);
    await finishIfReady(updated, req.app.get('io'));
    res.json({ message: 'Answers submitted successfully', score });
  } catch (e) { console.error('Submit battle:',e.message); res.status(500).json({ message: 'Could not submit answers' }); }
}
module.exports = { challenge, list, get, accept, decline, submit };
