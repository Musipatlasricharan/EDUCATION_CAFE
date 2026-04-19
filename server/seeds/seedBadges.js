const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const dotenv = require('dotenv');
const dns = require('dns');

// DNS Fixes for restrictive environments
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const badges = [
  {
    name: 'First Launch',
    description: 'Uploaded your first resource! Achievement unlocked.',
    icon: '🚀',
    category: 'Resource',
    trigger: 'first_launch',
    threshold: 1,
    points: 50,
    tier: 'bronze',
    rarity: 'Common'
  },
  {
    name: 'Knowledge Seeker',
    description: 'Downloaded your first resource! The journey begins.',
    icon: '📚',
    category: 'Download',
    trigger: 'first_download',
    threshold: 1,
    points: 50,
    tier: 'bronze',
    rarity: 'Common'
  }
];

async function seedBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    for (const badgeData of badges) {
      await Badge.findOneAndUpdate(
        { trigger: badgeData.trigger },
        badgeData,
        { upsert: true, new: true }
      );
      console.log(`Seeded badge: ${badgeData.name}`);
    }

    console.log('All badges seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding badges:', error);
    process.exit(1);
  }
}

seedBadges();
