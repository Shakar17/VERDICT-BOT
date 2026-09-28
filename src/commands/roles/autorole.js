const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure automatic role assignment.')
    .addSubcommand((sub) => sub.setName('set').setDescription('Set the autorole').addRoleOption((opt) => opt.setName('role').setDescription('Role to assign').setRequired(true)))
    .addSubcommand((sub) => sub.setName('remove').setDescription('Disable auto role'))
    .addSubcommand((sub) => sub.setName('view').setDescription('View autorole settings')),
  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Missing permission', description: 'Administrator permission is required for autorole settings.', color: 0xef4444 })], ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id }) || new GuildConfig({ guildId: interaction.guild.id });

    if (subcommand === 'set') {
      const role = interaction.options.getRole('role');
      config.autorole = { ...(config.autorole || {}), enabled: true, roleId: role.id };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Autorole set', description: `Members will now receive ${role}.`, color: 0x22c55e })] });
    }

    if (subcommand === 'remove') {
      config.autorole = { ...(config.autorole || {}), enabled: false, roleId: null };
      await config.save();
      return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Autorole removed', description: 'Auto role assignment has been disabled.', color: 0x22c55e })] });
    }

    const current = config.autorole?.roleId ? `<@&${config.autorole.roleId}>` : 'None';
    return interaction.reply({ embeds: [makeVerdictEmbed({ title: 'Autorole', description: `Current autorole: ${current}`, color: 0xf43f5e })] });
  },
};
