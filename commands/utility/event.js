const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Creates a server event'),
    async execute(interaction)
    { await interaction.reply('Event Created!'); },
};