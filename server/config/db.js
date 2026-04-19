const dns = require('dns')
const mongoose = require('mongoose')

// Force Node.js to use Google DNS so MongoDB Atlas SRV records resolve
// (local ISP/router DNS may block *.mongodb.net lookups)
try {
  dns.setDefaultResultOrder('ipv4first')
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (e) {
  console.warn('Could not configure DNS:', e.message);
}

const connectDB = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000, // 30s - give Atlas time to wake up from paused state
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
        retryWrites: true,
        maxPoolSize: 10,
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return; // Success - exit the retry loop
    } catch (error) {
      retries--;
      console.error(`❌ MongoDB Connection Error (${3 - retries}/3): ${error.message}`);
      if (retries > 0) {
        console.log(`   Retrying in 5 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('\n⚠️  CRITICAL: Could not connect to MongoDB Atlas after 3 attempts.');
        console.error('   → Your Atlas cluster may be PAUSED. Log in to https://cloud.mongodb.com and RESUME it.');
        console.error('   → Also ensure your current IP is whitelisted in Atlas Network Access.');
        console.error('   ⚡ Server will continue running - AI agents using Gemini will still work, but DB-dependent features will fail.\n');
        // Do NOT call process.exit(1) - let the server run in degraded mode
        // so AI agents (which call Gemini directly) can still function
      }
    }
  }
}

module.exports = connectDB
