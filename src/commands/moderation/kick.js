const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');
const { ModerationCase, GuildConfig } = require('../../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((option) => option.setName('user').setDescription('The member to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the kick').setRequired(false)),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'You need Kick Members permission.', color: 0xef4444 })], ephemeral: true });
    }

    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'User not found', description: 'That member could not be located.', color: 0xef4444 })], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Invalid action', description: 'You cannot kick yourself.', color: 0xef4444 })], ephemeral: true });
    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Hierarchy error', description: 'You cannot kick a member above or equal to your role.', color: 0xef4444 })], ephemeral: true });
    }

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const caseId = (config?.lastCaseId || 0) + 1;
    await ModerationCase.create({ guildId: interaction.guild.id, userId: target.id, moderatorId: interaction.user.id, action: 'kick', reason, caseId });
    await GuildConfig.findOneAndUpdate({ guildId: interaction.guild.id }, { $set: { lastCaseId: caseId } }, { upsert: true, new: true });

    await interaction.guild.members.kick(target, reason);
    await interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Member kicked', description: `<@${target.id}> was kicked.`, fields: [{ name: 'Reason', value: reason }, { name: 'Case', value: `#${caseId}` }], color: 0xf43f5e })] });
  },
};
