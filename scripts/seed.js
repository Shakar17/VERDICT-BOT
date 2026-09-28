const mongoose = require('mongoose');
const { mongoUri } = require('../src/config');
const { GuildConfig } = require('../src/models');

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('[VERDICT] Seed connected');
  } catch (error) {
    console.error('[VERDICT][SEED] Failed to connect:', error.message);
    process.exit(1);
  }

  const guild = await GuildConfig.findOne({ guildId: 'placeholder' });
  if (!guild) {
    await GuildConfig.create({ guildId: 'placeholder', name: 'Example Guild' });
    console.log('[VERDICT] Seed created');
  }

  process.exit(0);
})();
