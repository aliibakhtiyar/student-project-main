const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 80 },
  topic: { type: String, required: true, maxlength: 80 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: { type: String, required: true, unique: true },
  language: { type: String, enum: ['javascript','cpp','python','java','text'], default: 'javascript' },
  code: { type: String, default: '', maxlength: 6000 },
  revision: { type: Number, default: 0 },
}, { timestamps: true });
roomSchema.index({ members: 1, updatedAt: -1 });
module.exports = mongoose.model('StudyRoom', roomSchema);
