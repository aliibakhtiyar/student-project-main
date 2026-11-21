const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const User = require('../models/User');
const StudyRoom = require('../models/StudyRoom');
const RoomMessage = require('../models/RoomMessage');

function setupSockets(httpServer, origins) {
  const io = new Server(httpServer, { cors: { origin: origins, methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'], maxHttpBufferSize: 15000 });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId).select('name');
      if (!user) return next(new Error('Account not found'));
      socket.data.user = { id: String(user._id), name: user.name };
      next();
    } catch { next(new Error('Invalid session')); }
  });
  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);
    socket.on('room:subscribe', async ({ roomId } = {}, ack) => {
      if (!mongoose.isValidObjectId(roomId)) return ack?.({ error: 'Invalid room' });
      try {
        const room = await StudyRoom.exists({ _id: roomId, members: userId });
        if (!room) return ack?.({ error: 'Room access denied' });
        socket.join(`room:${roomId}`);
        ack?.({ ok: true });
      } catch { ack?.({ error: 'Could not join room updates' }); }
    });
    socket.on('room:unsubscribe', ({ roomId } = {}) => {
      if (mongoose.isValidObjectId(roomId)) socket.leave(`room:${roomId}`);
    });
    socket.on('room:chat', async ({ roomId, text } = {}, ack) => {
      if (!mongoose.isValidObjectId(roomId) || typeof text !== 'string' ||
        !text.trim() || text.length > 1000) return ack?.({ error: 'Invalid message' });
      if (Date.now() - (socket.data.lastChat || 0) < 850)
        return ack?.({ error: 'Please slow down' });
      socket.data.lastChat = Date.now();
      try {
        if (!await StudyRoom.exists({ _id: roomId, members: userId }))
          return ack?.({ error: 'Room access denied' });
        const saved = await RoomMessage.create({ room: roomId, author: userId, text: text.trim() });
        const result = { id: String(saved._id), roomId, authorId: userId,
          name: socket.data.user.name, text: saved.text, createdAt: saved.createdAt };
        io.to(`room:${roomId}`).emit('room:chat', result);
        ack?.({ ok: true });
      } catch { ack?.({ error: 'Unable to send message' }); }
    });
    socket.on('room:edit', async ({ roomId, revision, code, language } = {}, ack) => {
      if (!mongoose.isValidObjectId(roomId) || !Number.isInteger(revision) ||
        revision < 0 || typeof code !== 'string' || code.length > 6000 ||
        !['javascript','cpp','python','java','text'].includes(language))
        return ack?.({ error: 'Invalid editor update' });
      if (Date.now() - (socket.data.lastEdit || 0) < 300)
        return ack?.({ error: 'Saving too frequently' });
      socket.data.lastEdit = Date.now();
      try {
        const room = await StudyRoom.findOneAndUpdate({ _id: roomId, members: userId, revision },
          { $set: { code, language }, $inc: { revision: 1 } }, { new: true });
        if (!room) return ack?.({ error: 'Editor has newer changes. Refresh to merge.' });
        io.to(`room:${roomId}`).emit('room:code', { roomId, code: room.code,
          language: room.language, revision: room.revision, editorId: userId });
        ack?.({ ok: true, revision: room.revision });
      } catch { ack?.({ error: 'Editor update failed' }); }
    });
  });
  return io;
}
module.exports = setupSockets;
