const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client) {
  const commandDir = path.join(__dirname, '..', 'commands');
  const commandFiles = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith('.js')) commandFiles.push(fullPath);
    }
  }

  walk(commandDir);

  for (const file of commandFiles) {
    const command = require(file);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }

  return client.commands;
}

module.exports = loadCommands;
