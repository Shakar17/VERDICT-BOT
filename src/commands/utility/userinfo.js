const { SlashCommandBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View information about a user.')
    .addUserOption((option) => option.setName('user').setDescription('The user to inspect').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id) || await interaction.guild.members.fetch(target.id).catch(() => null);
    const embed = makeVerdictEmbed({
      title: `${target.username}#${target.discriminator}`,
      description: 'User information',
      fields: [
        { name: 'ID', value: target.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:f>`, inline: true },
        { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>` : 'Unknown', inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  },
};
