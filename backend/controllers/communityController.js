const mongoose = require('mongoose');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Battle = require('../models/Battle');
const { loadUserStats, loadLeaderboard } = require('../services/progressService');

const identity = (user) => ({ id: String(user._id), name: user.name,
  institute: user.institute, department: user.department || '',
  profileImage: user.profileImage || '' });
const pairKey = (a, b) => [String(a), String(b)].sort().join(':');
const objectId = (id) => mongoose.isValidObjectId(id);

async function stats(req, res) {
  try {
    const data = await loadUserStats(req.user._id);
    const userId = req.user._id;
    const [wins, losses, draws] = await Promise.all(['win', 'loss', 'draw'].map(async (type) => {
      let query;
      if (type === 'win') query = { status: 'finished', winner: userId };
      else if (type === 'draw') query = { status: 'finished', winner: null, $or: [{ challenger: userId }, { opponent: userId }] };
      else query = { status: 'finished', winner: { $nin: [userId, null] }, $or: [{ challenger: userId }, { opponent: userId }] };
      return Battle.countDocuments(query);
    }));
    res.json({ ...data, pvp: { wins, losses, draws } });
  } catch (e) { console.error('Stats:', e.message); res.status(500).json({ message: 'Could not load skill stats' }); }
}
async function leaderboard(req, res) {
  try {
    const period = ['week', 'month', 'all'].includes(req.query.period) ? req.query.period : 'week';
    const scope = ['global', 'college', 'friends'].includes(req.query.scope) ? req.query.scope : 'global';
    const from = period === 'all' ? null : new Date(Date.now() - (period === 'week' ? 7 : 30) * 86400000);
    let studentIds, college;
    if (scope === 'college') college = req.user.institute;
    if (scope === 'friends') {
      const friendships = await Friendship.find({ status: 'accepted', $or: [
        { requester: req.user._id }, { recipient: req.user._id },
      ] }).select('requester recipient').lean();
      studentIds = [req.user._id, ...friendships.map(f => String(f.requester) === String(req.user._id) ? f.recipient : f.requester)];
    }
    const leaders = await loadLeaderboard({ from, studentIds, college });
    res.json({ period, scope, leaders: leaders.map((r, i) => ({ ...r, rank: i + 1 })) });
  } catch (e) { console.error('Leaderboard:', e.message); res.status(500).json({ message: 'Could not load leaderboard' }); }
}
async function searchStudents(req, res) {
  const search = String(req.query.search || '').trim().slice(0, 60);
  if (search.length < 2) return res.json({ students: [] });
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const students = await User.find({ _id: { $ne: req.user._id }, name: { $regex: escaped, $options: 'i' } })
      .select('name institute department profileImage').limit(15).lean();
    res.json({ students: students.map(identity) });
  } catch (e) { res.status(500).json({ message: 'Student search failed' }); }
}
async function friends(req, res) {
  try {
    const data = await Friendship.find({ $or: [{ requester: req.user._id }, { recipient: req.user._id }] })
      .populate('requester', 'name institute department profileImage')
      .populate('recipient', 'name institute department profileImage').sort({ updatedAt: -1 }).lean();
    res.json({ friendships: data.filter(f => f.requester && f.recipient).map(f => ({
      id: String(f._id), status: f.status,
      direction: String(f.requester._id) === String(req.user._id) ? 'outgoing' : 'incoming',
      student: identity(String(f.requester._id) === String(req.user._id) ? f.recipient : f.requester),
    })) });
  } catch (e) { res.status(500).json({ message: 'Could not load friends' }); }
}
async function sendRequest(req, res) {
  const recipientId = String(req.body.recipientId || '');
  if (!objectId(recipientId) || recipientId === String(req.user._id)) return res.status(400).json({ message: 'Invalid student' });
  try {
    if (!await User.exists({ _id: recipientId })) return res.status(404).json({ message: 'Student not found' });
    const dailyRequests = await Friendship.countDocuments({
      requester: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (dailyRequests >= 20) return res.status(429).json({ message: 'Friend request daily limit reached' });
    const existing = await Friendship.findOne({ pairKey: pairKey(req.user._id, recipientId) });
    if (existing) return res.status(409).json({ message: 'Friend request already exists' });
    const record = await Friendship.create({ pairKey: pairKey(req.user._id, recipientId), requester: req.user._id, recipient: recipientId });
    req.app.get('io')?.to(`user:${recipientId}`).emit('social:update');
    res.status(201).json({ id: record._id, message: 'Friend request sent' });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Friend request already exists' });
    res.status(500).json({ message: 'Could not send request' });
  }
}
async function acceptRequest(req, res) {
  try {
    const record = await Friendship.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, status: 'pending' },
      { $set: { status: 'accepted' } }, { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Pending request not found' });
    req.app.get('io')?.to(`user:${String(record.requester)}`).emit('social:update');
    res.json({ message: 'Friend request accepted' });
  } catch (e) { res.status(400).json({ message: 'Could not accept request' }); }
}
async function removeFriend(req, res) {
  try {
    const record = await Friendship.findOneAndDelete({ _id: req.params.id,
      $or: [{ requester: req.user._id }, { recipient: req.user._id }] });
    if (!record) return res.status(404).json({ message: 'Request or friendship not found' });
    const otherId = String(record.requester) === String(req.user._id) ? record.recipient : record.requester;
    req.app.get('io')?.to(`user:${String(otherId)}`).emit('social:update');
    res.json({ message: 'Removed' });
  } catch (e) { res.status(400).json({ message: 'Could not remove request' }); }
}
module.exports = { stats, leaderboard, searchStudents, friends, sendRequest, acceptRequest, removeFriend };
