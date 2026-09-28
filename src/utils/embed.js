const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config');

function makeVerdictEmbed({ title, description = '', fields = [], footer = 'VERDICT', color = colors.primary, timestamp = true } = {}) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: footer });

  if (fields.length) embed.addFields(fields);
  if (timestamp) embed.setTimestamp();

  return embed;
}

module.exports = {
  makeVerdictEmbed,
  successEmbed: (title, description) => makeVerdictEmbed({ title, description, color: colors.success }),
  warnEmbed: (title, description) => makeVerdictEmbed({ title, description, color: colors.warn }),
  errorEmbed: (title, description) => makeVerdictEmbed({ title, description, color: colors.error }),
};
