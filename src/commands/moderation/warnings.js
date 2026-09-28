const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { Warning } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user.')
    .addUserOption((option) => option.setName('user').setDescription('The member to inspect').setRequired(false)),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Moderate Members permission.', color: 0xef4444 })], ephemeral: true });
    }

    const target = interaction.options.getMember('user') || interaction.member;
    const warnings = await Warning.find({ guildId: interaction.guild.id, userId: target.id }).sort({ timestamp: -1 }).limit(10);

    if (!warnings.length) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'No warnings', description: `<@${target.id}> has no recorded warnings.`, color: 0x22c55e })] });
    }

    const fields = warnings.map((warning) => ({ name: `Warning ${warning.warningId}`, value: `${warning.reason} • by <@${warning.moderatorId}>`, inline: false }));
    await interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Warnings', description: `Warnings for <@${target.id}>.`, fields, color: 0xfbbf24 })] });
  },
};
