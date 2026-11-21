const mongoose = require('mongoose');
const roomMessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });
roomMessageSchema.index({ room: 1, createdAt: -1 });
module.exports = mongoose.model('RoomMessage', roomMessageSchema);
