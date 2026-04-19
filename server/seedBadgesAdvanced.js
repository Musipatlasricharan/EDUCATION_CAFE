const connectDB = require('./config/db');
require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('./models/Badge');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');


const badges = [
    // 1. Resource Contributor Badges
    {
        name: 'First Launch',
        description: 'First resource posted! You are now a contributor.',
        icon: 'Rocket',
        color: '#3b82f6',
        category: 'Resource',
        trigger: 'first_launch',
        threshold: 1,
        points: 50,
        tier: 'bronze',
        rarity: 'Common'
    },
    {
        name: 'Payload Drop',
        description: 'Posted 10 resources. You are a consistent contributor.',
        icon: 'Package',
        color: '#10b981',
        category: 'Resource',
        trigger: 'payload_drop',
        threshold: 10,
        points: 150,
        tier: 'silver',
        rarity: 'Uncommon'
    },
    {
        name: 'Orbital Contributor',
        description: 'Reached 50 resources! A trusted community source.',
        icon: 'Orbit',
        color: '#8b5cf6',
        category: 'Resource',
        trigger: 'orbital_contributor',
        threshold: 50,
        points: 500,
        tier: 'gold',
        rarity: 'Rare'
    },
    {
        name: 'Deep Space Archive',
        description: '100+ Resources with high ratings. Elite status.',
        icon: 'Archive',
        color: '#f59e0b',
        category: 'Resource',
        trigger: 'deep_space_archive',
        threshold: 100,
        points: 1000,
        tier: 'platinum',
        rarity: 'Epic'
    },

    // 2. Daily Engagement Badges
    {
        name: 'Ignition',
        description: '3 consecutive days of resource access.',
        icon: 'Flame',
        color: '#f97316',
        category: 'Engagement',
        trigger: 'ignition',
        threshold: 3,
        points: 30,
        tier: 'bronze',
        rarity: 'Common'
    },
    {
        name: 'Steady Orbit',
        description: '7 consecutive days of resource access.',
        icon: 'RefreshCw',
        color: '#06b6d4',
        category: 'Engagement',
        trigger: 'steady_orbit',
        threshold: 7,
        points: 100,
        tier: 'silver',
        rarity: 'Uncommon'
    },
    {
        name: 'Atmospheric Burn',
        description: '30 consecutive days of resource access.',
        icon: 'Zap',
        color: '#ec4899',
        category: 'Engagement',
        trigger: 'atmospheric_burn',
        threshold: 30,
        points: 500,
        tier: 'gold',
        rarity: 'Rare'
    },
    {
        name: 'Gravity Lock',
        description: '100 consecutive days. Rare prestige level.',
        icon: 'Lock',
        color: '#ef4444',
        category: 'Engagement',
        trigger: 'gravity_lock',
        threshold: 100,
        points: 2000,
        tier: 'platinum',
        rarity: 'Legendary'
    },
    {
        name: 'Streak Resurrection',
        description: 'Returned and rebuilt a streak after a break.',
        icon: 'RotateCcw',
        color: '#6366f1',
        category: 'Engagement',
        trigger: 'streak_resurrection',
        threshold: 1,
        points: 200,
        tier: 'silver',
        rarity: 'Uncommon'
    },

    // 3. Discussion Victory Badges
    {
        name: 'Signal Found',
        description: 'Won your first peer-voted discussion.',
        icon: 'Signal',
        color: '#14b8a6',
        category: 'Discussion',
        trigger: 'signal_found',
        threshold: 1,
        points: 100,
        tier: 'bronze',
        rarity: 'Common'
    },
    {
        name: 'Resonance',
        description: 'Won 3 discussions in a single group.',
        icon: 'Users',
        color: '#a855f7',
        category: 'Discussion',
        trigger: 'resonance',
        threshold: 3,
        points: 400,
        tier: 'silver',
        rarity: 'Rare'
    },
    {
        name: 'Event Horizon',
        description: 'Won 10 discussions platform-wide.',
        icon: 'Trophy',
        color: '#d946ef',
        category: 'Discussion',
        trigger: 'event_horizon',
        threshold: 10,
        points: 1000,
        tier: 'gold',
        rarity: 'Epic'
    },
    {
        name: 'Unanimous Call',
        description: 'Won with 90% or more community consensus.',
        icon: 'CheckCircle',
        color: '#22c55e',
        category: 'Discussion',
        trigger: 'unanimous_call',
        threshold: 1,
        points: 1500,
        tier: 'platinum',
        rarity: 'Legendary'
    },
    {
        name: 'The Arbitrator',
        description: 'Won a discussion in 5 different groups.',
        icon: 'Scale',
        color: '#475569',
        category: 'Discussion',
        trigger: 'the_arbitrator',
        threshold: 5,
        points: 2000,
        tier: 'platinum',
        rarity: 'Legendary'
    },
    {
        name: 'First Download',
        description: 'Quality ensured! You downloaded your first resource.',
        icon: 'Download',
        color: '#10b981',
        category: 'Download',
        trigger: 'first_download',
        threshold: 1,
        points: 20,
        tier: 'bronze',
        rarity: 'Common'
    },
    {
        name: 'Century Contributor',
        description: 'Reached 100 Downloads/Uploads milestone!',
        icon: 'Award',
        color: '#f59e0b',
        category: 'Milestone',
        trigger: 'milestone_100',
        threshold: 100,
        points: 500,
        tier: 'gold',
        rarity: 'Rare'
    },
    {
        name: 'Century Plus',
        description: 'Reached 200 Downloads/Uploads milestone! You are a dedicated member.',
        icon: 'Shield',
        color: '#f97316',
        category: 'Milestone',
        trigger: 'milestone_200',
        threshold: 200,
        points: 800,
        tier: 'gold',
        rarity: 'Rare'
    },
    {
        name: 'Millenium Legend',
        description: 'Reached 1000 milestone! Absolute Legend.',
        icon: 'Crown',
        color: '#7c3aed',
        category: 'Milestone',
        trigger: 'milestone_1000',
        threshold: 1000,
        points: 5000,
        tier: 'platinum',
        rarity: 'Legendary'
    }
];

const seedBadges = async () => {
    await connectDB();
    try {
        await Badge.deleteMany({});
        console.log('Old badges cleared.');
        await Badge.insertMany(badges);
        console.log('Advanced Badges Seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBadges();
