const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { Warning } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Delete all warnings for a user.')
    .addUserOption((option) => option.setName('user').setDescription('The user to clear warnings for').setRequired(true)),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Moderate Members permission.', color: 0xef4444 })], ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const result = await Warning.deleteMany({ guildId: interaction.guild.id, userId: target.id });
    await interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Warnings cleared', description: `All warnings for <@${target.id}> were removed. (${result.deletedCount})`, color: 0x22c55e })] });
  },
};
