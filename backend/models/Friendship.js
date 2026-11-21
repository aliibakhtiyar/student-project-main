const mongoose = require('mongoose');
const friendshipSchema = new mongoose.Schema({
  pairKey: { type: String, required: true, unique: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, { timestamps: true });
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });
module.exports = mongoose.model('Friendship', friendshipSchema);
