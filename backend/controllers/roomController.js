const crypto = require('crypto');
const mongoose = require('mongoose');
const StudyRoom = require('../models/StudyRoom');
const RoomMessage = require('../models/RoomMessage');
const safeId = (id) => mongoose.isValidObjectId(id);
function view(room) {
  const r = room.toObject ? room.toObject() : room;
  return { id: String(r._id), title: r.title, topic: r.topic,
    owner: String(r.owner._id || r.owner), joinCode: r.joinCode,
    members: r.members.map(m => ({ id: String(m._id || m), name: m.name || '' })),
    language: r.language, code: r.code, revision: r.revision,
    updatedAt: r.updatedAt };
}
async function mine(req, res) {
  try {
    const rooms = await StudyRoom.find({ members: req.user._id }).sort({ updatedAt: -1 }).limit(60)
      .populate('members', 'name');
    res.json({ rooms: rooms.map(view) });
  } catch (e) { res.status(500).json({ message: 'Could not load study rooms' }); }
}
async function create(req, res) {
  const title = String(req.body.title || '').trim();
  const topic = String(req.body.topic || '').trim();
  if (title.length < 3 || title.length > 80 || topic.length < 2 || topic.length > 80)
    return res.status(400).json({ message: 'Enter a valid room title and topic' });
  try {
    if (await StudyRoom.countDocuments({ owner: req.user._id }) >= 15)
      return res.status(429).json({ message: 'You can create up to 15 rooms' });
    const room = await StudyRoom.create({ title, topic, owner: req.user._id,
      members: [req.user._id], joinCode: crypto.randomBytes(5).toString('hex').toUpperCase() });
    res.status(201).json({ room: view(room) });
  } catch (e) { res.status(500).json({ message: 'Could not create room' }); }
}
async function join(req, res) {
  const code = String(req.body.joinCode || '').trim().toUpperCase();
  if (!/^[A-F0-9]{10}$/.test(code)) return res.status(400).json({ message: 'Invalid room invite code' });
  try {
    const room = await StudyRoom.findOneAndUpdate({ joinCode: code,
      members: { $ne: req.user._id }, $expr: { $lt: [{ $size: '$members' }, 8] } },
      { $addToSet: { members: req.user._id } }, { new: true });
    if (!room) {
      const existing = await StudyRoom.findOne({ joinCode: code });
      if (existing?.members.some(m => String(m) === String(req.user._id)))
        return res.json({ room: view(existing) });
      return res.status(404).json({ message: 'Room not found or full (8 students max)' });
    }
    req.app.get('io')?.to(`room:${room._id}`).emit('room:membership', { roomId: String(room._id) });
    res.json({ room: view(room) });
  } catch (e) { res.status(500).json({ message: 'Could not join room' }); }
}
async function get(req, res) {
  if (!safeId(req.params.id)) return res.status(400).json({ message: 'Invalid room' });
  try {
    const room = await StudyRoom.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'name');
    if (!room) return res.status(404).json({ message: 'Room not found or no access' });
    res.json({ room: view(room) });
  } catch (e) { res.status(500).json({ message: 'Could not load room' }); }
}
async function messages(req, res) {
  if (!safeId(req.params.id)) return res.status(400).json({ message: 'Invalid room' });
  try {
    if (!await StudyRoom.exists({ _id: req.params.id, members: req.user._id }))
      return res.status(404).json({ message: 'Room not found' });
    const records = await RoomMessage.find({ room: req.params.id }).sort({ createdAt: -1 })
      .limit(100).populate('author', 'name').lean();
    res.json({ messages: records.reverse().map(r => ({
      id: String(r._id), authorId: String(r.author?._id || ''),
      name: r.author?.name || 'Student', text: r.text, createdAt: r.createdAt,
    })) });
  } catch (e) { res.status(500).json({ message: 'Could not load messages' }); }
}
async function leave(req, res) {
  if (!safeId(req.params.id)) return res.status(400).json({ message: 'Invalid room' });
  try {
    const room = await StudyRoom.findOne({ _id: req.params.id, members: req.user._id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (String(room.owner) === String(req.user._id)) {
      return res.status(400).json({ message: 'Room owner cannot leave. You can continue using the room.' });
    }
    await StudyRoom.updateOne({ _id: room._id }, { $pull: { members: req.user._id } });
    req.app.get('io')?.to(`room:${room._id}`).emit('room:membership', { roomId: String(room._id) });
    res.json({ message: 'Left room' });
  } catch (e) { res.status(500).json({ message: 'Could not leave room' }); }
}
module.exports = { mine, create, join, get, messages, leave };
