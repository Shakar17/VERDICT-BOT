# VERDICT

VERDICT is a production-oriented Discord moderation and management bot with a web dashboard, MongoDB-backed configuration, and per-server settings.

## Features

- Moderation tools: ban, kick, timeout, warn, clear, lock, slowmode, nick, role
- Welcome and leave systems
- Auto-role and verification
- Ticket system with buttons and transcripts
- Logging system
- Leveling and leaderboard
- Giveaways
- Utility commands and modern help menu
- Multi-server MongoDB configuration
- Express dashboard with Discord OAuth

## Requirements

- Node.js 18+
- MongoDB instance (MongoDB Atlas or local)
- Discord application with bot token
- Render account for deployment (optional)

## 1. Install Node.js

Download and install Node.js LTS from https://nodejs.org/

Validate installation:

```bash
node -v
npm -v
```

## 2. Create a Discord Application

1. Go to the Discord Developer Portal.
2. Create a new application.
3. Open the Bot section.
4. Create a bot and copy the token.
5. Enable the required intents and bot permissions.

## 3. Required Intents

Enable these gateway intents on the bot:

- Guilds
- Guild Members
- Guild Moderation
- Guild Messages
- Guild Message Reactions
- Direct Messages
- Message Content

## 4. OAuth2 Setup

1. In the Developer Portal, go to OAuth2 > General.
2. Add redirect URL: `http://localhost:3000/auth/discord/callback`
3. Select the required scopes:
   - `identify`
   - `guilds`
4. Enable the bot scope if needed.

## 5. MongoDB Setup

Use MongoDB Atlas or a local MongoDB instance.

Example connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/verdict
```

## 6. Environment Variables

Copy `.env.example` to `.env` and complete the values:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
MONGODB_URI=your_mongodb_connection
DISCORD_CLIENT_SECRET=your_oauth_client_secret
DASHBOARD_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
PORT=3000
```

## 7. Install Dependencies

```bash
npm install
```

## 8. Local Startup

```bash
npm start
```

## 9. Dashboard Startup

The dashboard runs with the main application process. It listens on the configured PORT.

## 10. Render Deployment

1. Connect your GitHub repository to Render.
2. Add the environment variables from `.env.example`.
3. Use the included `render.yaml`.
4. Deploy.

## 11. Deployment Commands

```bash
npm install
npm start
```

## 12. Troubleshooting

- Bot is offline: check the token and intents.
- Dashboard fails: confirm `DASHBOARD_URL`, `DISCORD_CLIENT_SECRET`, and `SESSION_SECRET`.
- Database errors: verify `MONGODB_URI` and server access.
- Slash commands missing: check `DISCORD_TOKEN` and ensure the bot has application commands permission.

## Required Discord Permissions

Grant the bot these permissions for a typical setup:

- Administrator (or a narrower set depending on your security model)
- Manage Roles
- Manage Channels
- Kick Members
- Ban Members
- Moderate Members
- Manage Messages
- Read Message History
- Send Messages
- Embed Links
- Attach Files
- View Audit Log
- Manage Nicknames
- Create Public Threads
- Manage Threads

## License

MIT
