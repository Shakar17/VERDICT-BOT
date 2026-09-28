const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View a user avatar.')
    .addUserOption((option) => option.setName('user').setDescription('The user to inspect').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const avatar = target.displayAvatarURL({ dynamic: true, size: 512 });
    const embed = makeVerdictEmbed({
      title: `${target.username}'s avatar`,
      description: `[Open avatar](${avatar})`,
    });
    embed.setImage(avatar);
    await interaction.reply({ embeds: [embed] });
  },
};
