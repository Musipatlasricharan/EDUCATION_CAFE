const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  isPublic: { type: Boolean, default: false },
  coverColor: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
