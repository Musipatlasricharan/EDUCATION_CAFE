const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  color: String,
  category: { type: String, enum: ['Resource', 'Engagement', 'Discussion', 'Special', 'Download', 'Milestone'], required: true },
  trigger: { type: String, required: true, unique: true },
  threshold: { type: Number, default: 1 },
  points: { type: Number, default: 50 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'legendary'], default: 'bronze' },
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], default: 'Common' }
});

module.exports = mongoose.model('Badge', badgeSchema);
