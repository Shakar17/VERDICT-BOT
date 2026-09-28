const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { GuildConfig, ModerationCase } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .addUserOption((option) => option.setName('user').setDescription('The member to ban').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addIntegerOption((option) => option.setName('days').setDescription('Delete recent messages in days').setMinValue(0).setMaxValue(7)),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Ban Members permission.', color: 0xef4444 })], ephemeral: true });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!target) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'User not found', description: 'That member could not be located.', color: 0xef4444 })], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Invalid action', description: 'You cannot ban yourself.', color: 0xef4444 })], ephemeral: true });
    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Hierarchy error', description: 'You cannot ban a member above or equal to your role.', color: 0xef4444 })], ephemeral: true });
    }

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const caseId = (config?.lastCaseId || 0) + 1;
    await ModerationCase.create({ guildId: interaction.guild.id, userId: target.id, moderatorId: interaction.user.id, action: 'ban', reason, caseId });
    await GuildConfig.findOneAndUpdate({ guildId: interaction.guild.id }, { $set: { lastCaseId: caseId } }, { upsert: true, new: true });

    await interaction.guild.members.ban(target, { deleteMessageSeconds: days * 86400, reason });
    await interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Member banned', description: `<@${target.id}> was banned.`, fields: [{ name: 'Reason', value: reason }, { name: 'Case', value: `#${caseId}` }], color: 0xf43f5e })] });
  },
};
