const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { Warning, GuildConfig } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a server member.')
    .addUserOption((option) => option.setName('user').setDescription('The member to warn').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the warning').setRequired(false)),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Moderate Members permission.', color: 0xef4444 })], ephemeral: true });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'User not found', description: 'That member could not be located.', color: 0xef4444 })], ephemeral: true });
    const warningId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await Warning.create({ guildId: interaction.guild.id, userId: target.id, moderatorId: interaction.user.id, reason, warningId });

    const warnings = await Warning.countDocuments({ guildId: interaction.guild.id, userId: target.id });
    await interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Warning issued', description: `<@${target.id}> has been warned.`, fields: [{ name: 'Reason', value: reason }, { name: 'Total warnings', value: `${warnings}` }], color: 0xfbbf24 })] });
  },
};
