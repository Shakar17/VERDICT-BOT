const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('View information about VERDICT.'),
  async execute(interaction) {
    const bot = interaction.client.user;
    const embed = makeVerdictEmbed({
      title: 'VERDICT',
      description: 'Decide. Manage. Protect.',
      fields: [
        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: 'Latency', value: `${interaction.client.ws.ping}ms`, inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  },
};
