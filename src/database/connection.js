const mongoose = require('mongoose');
const { mongoUri } = require('../config');

async function connectDatabase() {
  if (!mongoUri) {
    console.warn('[VERDICT][DATABASE] MongoDB URI not provided. Database features disabled.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });
    console.log('[VERDICT] Database connected');
    return true;
  } catch (error) {
    console.error('[VERDICT][DATABASE] Connection failed:', error.message);
    return false;
  }
}

module.exports = connectDatabase;
