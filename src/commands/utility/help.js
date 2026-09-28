const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { makeVerdictEmbed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Open the VERDICT help menu.'),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('Select a command category')
      .addOptions([
        { label: 'Moderation', value: 'moderation', description: 'Moderation tools' },
        { label: 'Welcome', value: 'welcome', description: 'Welcome configuration' },
        { label: 'Security', value: 'security', description: 'Safety and automod' },
        { label: 'Tickets', value: 'tickets', description: 'Support tickets' },
        { label: 'Roles', value: 'roles', description: 'Role panels and autorole' },
        { label: 'Leveling', value: 'leveling', description: 'XP and leaderboard' },
        { label: 'Giveaways', value: 'giveaways', description: 'Prize giveaways' },
        { label: 'Utility', value: 'utility', description: 'Server and bot info' },
        { label: 'Configuration', value: 'configuration', description: 'Server settings' },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);
    const embed = makeVerdictEmbed({ title: 'VERDICT Help', description: 'Choose a category to browse available commands.', color: 0xf43f5e });
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
