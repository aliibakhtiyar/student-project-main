const mongoose = require('mongoose');
const battleQuestion = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });
const submission = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  submittedAt: { type: Date, required: true },
}, { _id: false });
const battleSchema = new mongoose.Schema({
  challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true, maxlength: 80 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  durationSeconds: { type: Number, default: 600 },
  questions: [battleQuestion],
  status: { type: String, enum: ['pending', 'active', 'finished', 'declined', 'expired'], default: 'pending', index: true },
  startsAt: Date,
  endsAt: Date,
  inviteExpiresAt: { type: Date, required: true },
  submissions: [submission],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
battleSchema.index({ challenger: 1, createdAt: -1 });
battleSchema.index({ opponent: 1, createdAt: -1 });
module.exports = mongoose.model('Battle', battleSchema);
