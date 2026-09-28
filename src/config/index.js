require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  mongoUri: process.env.MONGODB_URI || '',
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'verdict-dev-secret',
  port: Number(process.env.PORT || 3000),
  botName: 'VERDICT',
  botDescription: 'Decide. Manage. Protect.',
  colors: {
    primary: 0xf43f5e,
    success: 0x22c55e,
    warn: 0xfbbf24,
    error: 0xef4444,
    dark: 0x111827,
  },
};
