const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency.'),
  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;
    const embed = makeVerdictEmbed({
      title: 'PING',
      description: `Websocket: ${interaction.client.ws.ping}ms\nAPI: ${latency}ms`,
    });
    await interaction.reply({ embeds: [embed] });
  },
};
