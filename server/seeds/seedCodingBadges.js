const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const dotenv = require('dotenv');
const dns = require('dns');

// DNS Fixes for restrictive environments
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const codingBadges = [
  // Milestone badges
  {
    name: 'First Code',
    description: 'Solved your first coding challenge!',
    icon: '💻',
    color: '#00D9FF',
    category: 'CodingChallenge',
    trigger: 'first_code',
    threshold: 1,
    points: 100,
    tier: 'bronze',
    rarity: 'Common'
  },
  {
    name: 'Rookie Coder',
    description: 'Solved 5 coding challenges!',
    icon: '🌱',
    color: '#4CAF50',
    category: 'CodingChallenge',
    trigger: 'rookie_coder',
    threshold: 5,
    points: 150,
    tier: 'bronze',
    rarity: 'Uncommon'
  },
  {
    name: 'Intermediate Coder',
    description: 'Solved 15 coding challenges!',
    icon: '⚡',
    color: '#FF9800',
    category: 'CodingChallenge',
    trigger: 'intermediate_coder',
    threshold: 15,
    points: 250,
    tier: 'silver',
    rarity: 'Rare'
  },
  {
    name: 'Code Master',
    description: 'Solved 50 coding challenges!',
    icon: '👑',
    color: '#FFD700',
    category: 'CodingChallenge',
    trigger: 'code_master',
    threshold: 50,
    points: 500,
    tier: 'gold',
    rarity: 'Epic'
  },
  {
    name: 'Code Legend',
    description: 'Solved 100 coding challenges! You are a legend!',
    icon: '🔥',
    color: '#FF1744',
    category: 'CodingChallenge',
    trigger: 'code_legend',
    threshold: 100,
    points: 1000,
    tier: 'platinum',
    rarity: 'Legendary'
  },

  // Language-specific badges
  {
    name: 'C++ Expert',
    description: 'Solved 5 challenges in C++',
    icon: '⚙️',
    color: '#0099CC',
    category: 'CodingChallenge',
    trigger: 'cpp_expert',
    threshold: 5,
    points: 200,
    tier: 'silver',
    rarity: 'Rare'
  },
  {
    name: 'Python Expert',
    description: 'Solved 5 challenges in Python',
    icon: '🐍',
    color: '#3776AB',
    category: 'CodingChallenge',
    trigger: 'python_expert',
    threshold: 5,
    points: 200,
    tier: 'silver',
    rarity: 'Rare'
  },
  {
    name: 'Java Expert',
    description: 'Solved 5 challenges in Java',
    icon: '☕',
    color: '#007396',
    category: 'CodingChallenge',
    trigger: 'java_expert',
    threshold: 5,
    points: 200,
    tier: 'silver',
    rarity: 'Rare'
  },
  {
    name: 'C Expert',
    description: 'Solved 5 challenges in C',
    icon: '🎯',
    color: '#A8B9CC',
    category: 'CodingChallenge',
    trigger: 'c_expert',
    threshold: 5,
    points: 200,
    tier: 'silver',
    rarity: 'Rare'
  },

  // Problem difficulty badges
  {
    name: 'Hard Problem Solver',
    description: 'Solved 10 hard coding challenges!',
    icon: '💪',
    color: '#E91E63',
    category: 'CodingChallenge',
    trigger: 'hard_problem_solver',
    threshold: 10,
    points: 400,
    tier: 'gold',
    rarity: 'Epic'
  }
];

async function seedCodingBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    for (const badgeData of codingBadges) {
      await Badge.findOneAndUpdate(
        { trigger: badgeData.trigger },
        badgeData,
        { upsert: true, new: true }
      );
      console.log(`Seeded badge: ${badgeData.name}`);
    }

    console.log('All coding badges seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding coding badges:', error);
    process.exit(1);
  }
}

seedCodingBadges();
