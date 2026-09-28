const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('View information about a channel.')
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to inspect').setRequired(false)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const embed = makeVerdictEmbed({
      title: channel.name,
      description: 'Channel overview',
      fields: [
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channel.type, inline: true },
        { name: 'Category', value: channel.parent ? channel.parent.name : 'None', inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  },
};
