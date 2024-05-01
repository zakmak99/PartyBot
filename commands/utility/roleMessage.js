const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-message')
        .setDescription('Sets up a role message for assigning roles via reactions.'),

    async execute(interaction) {
        await interaction.reply('Setting up role message...');
        const emote1 = '<:jett_VALORANT:1175499587105062986>';
        const emote2 = '<:cypher_VALORANT:1175499580033470495>';

        const rolesChannel = interaction.guild.channels.cache.find(channel => channel.name === 'roles');
        if (!rolesChannel) return;

        const roleMessage = await rolesChannel.send(`React to assign yourself a role: ${emote1} for Duelist, ${emote2} for Sentinel`);
        await roleMessage.react(emote1);
        await roleMessage.react(emote2);
    }
};
