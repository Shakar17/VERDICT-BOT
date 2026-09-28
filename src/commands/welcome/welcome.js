const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome behavior.')
    .addSubcommand((sub) => sub.setName('setup').setDescription('Set up welcome settings').addChannelOption((opt) => opt.setName('channel').setDescription('Welcome channel').setRequired(true)).addStringOption((opt) => opt.setName('message').setDescription('Welcome message').setRequired(false)))
    .addSubcommand((sub) => sub.setName('disable').setDescription('Disable welcome messages'))
    .addSubcommand((sub) => sub.setName('test').setDescription('Test the welcome message')),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'Administrator permission is required for welcome settings.', color: 0xef4444 })], ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const config = await GuildConfig.findOne({ guildId }) || new GuildConfig({ guildId });

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Welcome {user} to {server}!';
      config.welcome = { ...(config.welcome || {}), enabled: true, channelId: channel.id, message, embedColor: '#f43f5e', mentionMember: true, includeMemberCount: true };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Welcome configured', description: `Welcome messages are now enabled in ${channel}.`, fields: [{ name: 'Message', value: message }], color: 0x22c55e })] });
    }

    if (subcommand === 'disable') {
      config.welcome = { ...(config.welcome || {}), enabled: false };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Welcome disabled', description: 'Welcome messages are now disabled.', color: 0x22c55e })] });
    }

    if (subcommand === 'test') {
      const channel = interaction.guild.channels.cache.get(config.welcome?.channelId);
      if (!channel) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'No welcome channel', description: 'Set up the welcome channel first.', color: 0xef4444 })], ephemeral: true });
      const content = (config.welcome?.message || 'Welcome {user} to {server}!').replace('{user}', `<@${interaction.user.id}>`).replace('{username}', interaction.user.username).replace('{server}', interaction.guild.name).replace('{membercount}', String(interaction.guild.memberCount));
      await channel.send({ content });
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Welcome test sent', description: 'A welcome message has been sent to the configured channel.', color: 0x22c55e })] });
    }
  },
};
