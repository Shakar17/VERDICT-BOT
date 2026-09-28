const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('View information about a role.')
    .addRoleOption((option) => option.setName('role').setDescription('The role to inspect').setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const embed = makeVerdictEmbed({
      title: role.name,
      description: 'Role overview',
      fields: [
        { name: 'ID', value: role.id, inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Color', value: `${role.color || 0}`, inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  },
};
