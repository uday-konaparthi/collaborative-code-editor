const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  result: {type: String, default: ''},
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
