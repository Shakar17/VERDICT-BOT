const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Get the invite link for VERDICT.'),
  async execute(interaction) {
    const invite = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot%20applications.commands`;
    const embed = makeVerdictEmbed({
      title: 'Invite VERDICT',
      description: `[Click here to invite the bot](${invite})`,
    });
    await interaction.reply({ embeds: [embed] });
  },
};
