
module, exports = {
    emote1 = ':jett_VALORANT:';
    emote2 = ':cypher_VALORANT:';

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand() || interaction.commandName !== 'roles') return;

        const rolesChannel = interaction.guild.channels.cache.find(channel => channel.name === 'roles');
        if (!rolesChannel) return;

        const rolesMessage = await rolesChannel.send('React to assign yourself a role: ${emote1} for Duelist, ${emote2} for Sentinel');
        rolesMessage.react(emote1);
        rolesMessage.react(emote2);
    }),
};

// Listen for reactions on the roles message
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    const rolesChannel = reaction.message.channel;
    if (rolesChannel.name !== 'roles') return;

    if (reaction.emoji.name === emote1) {
        const role = rolesChannel.guild.roles.cache.find(role => role.name === 'Duelist');
        const member = rolesChannel.guild.members.cache.find(member => member.id === user.id);
        if (role && member) {
            await member.roles.add(role);
        }
    } else if (reaction.emoji.name === emote2) {
        const role = rolesChannel.guild.roles.cache.find(role => role.name === 'Sentinel');
        const member = rolesChannel.guild.members.cache.find(member => member.id === user.id);
        if (role && member) {
            await member.roles.add(role);
        }
    }

});