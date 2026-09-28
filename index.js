const { Client, GatewayIntentBits, Partials, Collection, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const { token, clientId, mongoUri, dashboardUrl, sessionSecret, port } = require('./src/config');
const connectDatabase = require('./src/database/connection');
const loadCommands = require('./src/handlers/commandLoader');
const { GuildConfig, Warning, ModerationCase, Ticket, Level, Giveaway, Verification } = require('./src/models');
const { makeVerdictEmbed } = require('./src/utils/embed');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();
client.cooldowns = new Map();
client.startTime = Date.now();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'dashboard', 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dashboard', 'public')));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Please slow down.',
}));

app.get('/', (req, res) => res.render('index', { botName: 'VERDICT', dashboardUrl }));
app.get('/dashboard', (req, res) => {
  const user = req.session.user || null;
  res.render('dashboard', { user, botName: 'VERDICT', dashboardUrl });
});
app.get('/auth/discord', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(`${dashboardUrl}/auth/discord/callback`)}&response_type=code&scope=identify%20guilds`;
  res.redirect(redirect);
});
app.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const axios = require('axios');
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: clientId,
      client_secret: process.env.DISCORD_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${dashboardUrl}/auth/discord/callback`,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });

    req.session.user = userResponse.data;
    req.session.accessToken = tokenResponse.data.access_token;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('[VERDICT][DASHBOARD] OAuth failed:', error.message);
    res.status(500).send('OAuth failed');
  }
});

app.get('/api/guilds', async (req, res) => {
  if (!req.session.user || !req.session.accessToken) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const axios = require('axios');
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${req.session.accessToken}` },
    });

    const guilds = guildsResponse.data.filter((guild) => (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x08) === 0x08);
    res.json(guilds);
  } catch (error) {
    console.error('[VERDICT][DASHBOARD] Guild fetch failed:', error.message);
    res.status(500).json({ error: 'Unable to load guilds' });
  }
});

app.get('/api/config/:guildId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const config = await GuildConfig.findOne({ guildId: req.params.guildId }) || new GuildConfig({ guildId: req.params.guildId });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/config/:guildId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const guildId = req.params.guildId;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const update = { guildId, name: guild.name, ...req.body };
    const result = await GuildConfig.findOneAndUpdate({ guildId }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(result);
  } catch (error) {
    console.error('[VERDICT][DASHBOARD] Config save failed:', error.message);
    res.status(500).json({ error: 'Unable to save configuration' });
  }
});

client.once(Events.ClientReady, async () => {
  console.log('[VERDICT] Logged in as ' + client.user.tag);
  console.log('[VERDICT] Commands loaded');
  console.log('[VERDICT] Dashboard started');

  const baseGuilds = await GuildConfig.find({});
  console.log(`[VERDICT] Active Mongo config records: ${baseGuilds.length}`);
});

client.on(Events.GuildCreate, async (guild) => {
  try {
    await GuildConfig.findOneAndUpdate({ guildId: guild.id }, { guildId: guild.id, name: guild.name }, { upsert: true, new: true });
    console.log(`[VERDICT] Joined guild: ${guild.name} (${guild.id})`);
  } catch (error) {
    console.error('[VERDICT][GUILD] Join setup failed:', error.message);
  }
});

client.on(Events.GuildDelete, async (guild) => {
  try {
    await GuildConfig.deleteOne({ guildId: guild.id });
    console.log(`[VERDICT] Left guild: ${guild.name} (${guild.id})`);
  } catch (error) {
    console.error('[VERDICT][GUILD] Leave cleanup failed:', error.message);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config || !config.autorole?.enabled || !config.autorole.roleId) return;

  const role = member.guild.roles.cache.get(config.autorole.roleId);
  if (!role) return;

  try {
    await member.roles.add(role).catch(() => {});
  } catch (error) {}
});

client.on(Events.GuildMemberRemove, async (member) => {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config || !config.leave?.enabled) return;

  const channel = member.guild.channels.cache.get(config.leave.channelId);
  if (!channel) return;

  const message = config.leave.message
    .replace('{user}', `<@${member.id}>`)
    .replace('{username}', member.user.username)
    .replace('{server}', member.guild.name);

  channel.send({ content: message }).catch(() => {});
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const config = await GuildConfig.findOne({ guildId: message.guild?.id });
  if (!config || !config.leveling?.enabled) return;

  const userId = message.author.id;
  const guildId = message.guild.id;
  const now = Date.now();
  const cooldownSeconds = config.leveling.cooldown || 30;

  const existing = await Level.findOne({ guildId, userId });
  if (!existing) {
    await Level.create({ guildId, userId, xp: 10, level: 1, lastMessageAt: new Date(now) });
    return;
  }

  const last = existing.lastMessageAt ? existing.lastMessageAt.getTime() : 0;
  if (now - last < cooldownSeconds * 1000) return;

  const xpGain = config.leveling.xpPerMessage || 10;
  const newXp = (existing.xp || 0) + xpGain;
  const newLevel = Math.floor(newXp / 100) + 1;

  existing.xp = newXp;
  existing.level = newLevel;
  existing.lastMessageAt = new Date(now);
  await existing.save();

  if (newLevel > (existing.level - 1 || 1)) {
    const channel = message.guild.channels.cache.get(config.leveling.levelUpChannelId || message.channel.id);
    if (channel) channel.send({ content: `${message.author} leveled up to level ${newLevel}!` }).catch(() => {});
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('[VERDICT][COMMAND] Execution error:', error);
    const embed = makeVerdictEmbed({
      title: 'Command failed',
      description: 'Something went wrong while executing that command.',
      color: 0xef4444,
    });

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
});

async function registerApplicationCommands() {
  const commandImports = [];
  const commandDir = path.join(__dirname, 'src', 'commands');
  const walk = (dir) => {
    for (const entry of require('fs').readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith('.js')) commandImports.push(fullPath);
    }
  };

  walk(commandDir);

  for (const file of commandImports) {
    try {
      const command = require(file);
      if (command && command.data) {
        client.commands.set(command.data.name, command);
      }
    } catch (error) {
      console.error('[VERDICT][COMMAND] Failed to load:', file, error.message);
    }
  }

  const commandsToRegister = [...client.commands.values()].map((cmd) => cmd.data.toJSON());
  if (client.user) {
    await client.application.commands.set(commandsToRegister);
    console.log('[VERDICT] Slash commands registered');
  }
}

(async () => {
  console.log('[VERDICT] Starting...');
  const dbReady = await connectDatabase();
  if (dbReady) {
    console.log('[VERDICT] Database connected');
  }
  await registerApplicationCommands();
  await client.login(token);
})();

process.on('uncaughtException', (error) => {
  console.error('[VERDICT][ERROR] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[VERDICT][ERROR] Unhandled rejection:', reason);
});

const server = app.listen(port, () => {
  console.log(`[VERDICT] Dashboard started on http://localhost:${port}`);
});

module.exports = { app, client, server };
