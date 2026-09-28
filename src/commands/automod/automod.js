const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure automatic moderation.')
    .addSubcommand((sub) => sub.setName('enable').setDescription('Enable automod'))
    .addSubcommand((sub) => sub.setName('disable').setDescription('Disable automod'))
    .addSubcommand((sub) => sub.setName('status').setDescription('Check automod status')),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'Administrator permission is required.', color: 0xef4444 })], ephemeral: true });
    }

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id }) || new GuildConfig({ guildId: interaction.guild.id });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'enable') {
      config.automod = { ...(config.automod || {}), enabled: true };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'AutoMod enabled', description: 'Automatic moderation checks are now active.', color: 0x22c55e })] });
    }

    if (subcommand === 'disable') {
      config.automod = { ...(config.automod || {}), enabled: false };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'AutoMod disabled', description: 'Automatic moderation checks are disabled.', color: 0x22c55e })] });
    }

    return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'AutoMod status', description: `Enabled: ${Boolean(config.automod?.enabled)}`, fields: [{ name: 'Action', value: config.automod?.action || 'warn' }], color: 0xf43f5e })] });
  },
};
