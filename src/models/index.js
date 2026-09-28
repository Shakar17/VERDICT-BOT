const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  prefix: { type: String, default: '/' },
  language: { type: String, default: 'en' },
  welcome: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    message: { type: String, default: 'Welcome {user} to {server}!' },
    embedColor: { type: String, default: '#f43f5e' },
    mentionMember: { type: Boolean, default: true },
    includeMemberCount: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },
  },
  leave: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    message: { type: String, default: '{user} left {server}.' },
    embedColor: { type: String, default: '#ef4444' },
  },
  autorole: {
    enabled: { type: Boolean, default: false },
    roleId: { type: String, default: null },
  },
  verification: {
    enabled: { type: Boolean, default: false },
    roleId: { type: String, default: null },
    unverifiedRoleId: { type: String, default: null },
    channelId: { type: String, default: null },
    message: { type: String, default: 'Press the button below to verify yourself.' },
  },
  automod: {
    enabled: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },
    mentions: { type: Boolean, default: false },
    badWords: { type: Boolean, default: false },
    invites: { type: Boolean, default: false },
    links: { type: Boolean, default: false },
    duplicate: { type: Boolean, default: false },
    flood: { type: Boolean, default: false },
    action: { type: String, default: 'warn' },
    logChannelId: { type: String, default: null },
    whitelistChannels: [{ type: String }],
    whitelistRoles: [{ type: String }],
    badWordsList: [{ type: String }],
  },
  logging: {
    memberJoin: { type: String, default: null },
    memberLeave: { type: String, default: null },
    messageDelete: { type: String, default: null },
    messageEdit: { type: String, default: null },
    roleCreate: { type: String, default: null },
    roleDelete: { type: String, default: null },
    channelCreate: { type: String, default: null },
    channelDelete: { type: String, default: null },
    ban: { type: String, default: null },
    unban: { type: String, default: null },
    kick: { type: String, default: null },
    timeout: { type: String, default: null },
    nickname: { type: String, default: null },
  },
  tickets: {
    enabled: { type: Boolean, default: false },
    categoryId: { type: String, default: null },
    staffRoleId: { type: String, default: null },
    transcriptChannelId: { type: String, default: null },
    panelChannelId: { type: String, default: null },
  },
  leveling: {
    enabled: { type: Boolean, default: false },
    xpPerMessage: { type: Number, default: 10 },
    cooldown: { type: Number, default: 30 },
    levelUpChannelId: { type: String, default: null },
  },
  giveaways: {
    defaultWinnerCount: { type: Number, default: 1 },
    defaultDurationMinutes: { type: Number, default: 60 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

guildConfigSchema.index({ guildId: 1 });

const warningSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: 'No reason provided' },
  timestamp: { type: Date, default: Date.now },
  warningId: { type: String, required: true, unique: true },
});

const moderationCaseSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  action: { type: String, required: true },
  reason: { type: String, default: 'No reason provided' },
  caseId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true, index: true },
  creatorId: { type: String, required: true },
  staffRoleId: { type: String, default: null },
  claimedBy: { type: String, default: null },
  status: { type: String, default: 'open' },
  transcript: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const levelSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });

levelSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const giveawaySchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  prize: { type: String, required: true },
  winnerCount: { type: Number, default: 1 },
  endsAt: { type: Date, required: true },
  status: { type: String, default: 'active' },
  entrants: [{ type: String }],
  winners: [{ type: String }],
  createdBy: { type: String, required: true },
}, { timestamps: true });

const verificationSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  roleId: { type: String, default: null },
  verifiedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const rolePanelSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  title: { type: String, default: 'Role Panel' },
  roles: [{ roleId: String, label: String }],
}, { timestamps: true });

module.exports = {
  GuildConfig: mongoose.model('GuildConfig', guildConfigSchema),
  Warning: mongoose.model('Warning', warningSchema),
  ModerationCase: mongoose.model('ModerationCase', moderationCaseSchema),
  Ticket: mongoose.model('Ticket', ticketSchema),
  Level: mongoose.model('Level', levelSchema),
  Giveaway: mongoose.model('Giveaway', giveawaySchema),
  Verification: mongoose.model('Verification', verificationSchema),
  RolePanel: mongoose.model('RolePanel', rolePanelSchema),
};
