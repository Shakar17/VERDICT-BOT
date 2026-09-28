const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('View server information.'),
  async execute(interaction) {
    const guild = interaction.guild;
    const embed = makeVerdictEmbed({
      title: guild.name,
      description: 'Server overview',
      fields: [
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  },
};
