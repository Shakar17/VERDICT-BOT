const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { GuildConfig } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View or update VERDICT server configuration.')
    .addStringOption((option) => option.setName('section').setDescription('Configuration section').addChoices(
      { name: 'welcome', value: 'welcome' },
      { name: 'logs', value: 'logs' },
      { name: 'autorole', value: 'autorole' },
      { name: 'automod', value: 'automod' },
      { name: 'tickets', value: 'tickets' },
      { name: 'leveling', value: 'leveling' },
      { name: 'verification', value: 'verification' }
    )),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Administrator permission.', color: 0xef4444 })], ephemeral: true });
    }

    const section = interaction.options.getString('section') || 'welcome';
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id }) || { guildId: interaction.guild.id };
    const fields = [];
    if (section === 'welcome') {
      fields.push({ name: 'Welcome enabled', value: String(Boolean(config.welcome?.enabled)), inline: true });
      fields.push({ name: 'Welcome message', value: config.welcome?.message || 'Not configured', inline: false });
    }
    if (section === 'automod') {
      fields.push({ name: 'AutoMod enabled', value: String(Boolean(config.automod?.enabled)), inline: true });
      fields.push({ name: 'Action', value: config.automod?.action || 'warn', inline: true });
    }
    if (section === 'verification') {
      fields.push({ name: 'Verification enabled', value: String(Boolean(config.verification?.enabled)), inline: true });
      fields.push({ name: 'Role configured', value: config.verification?.roleId ? '<set>' : 'not set', inline: true });
    }

    await interaction.reply({ embeds: [makeVerdictEmbed({ title: `${section.toUpperCase()} config`, description: `Current settings for ${section}.`, fields, color: 0x22c55e })] });
  },
};
