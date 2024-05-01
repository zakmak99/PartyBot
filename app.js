const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

module.exports = (client) => {
require('./commands/utility/roleMessage')(client);
};
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// handles the user inputting the command and responds
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.message.partial) {
        try {
            await reaction.message.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
        }
    }
    const member = await reaction.message.guild.members.fetch(user.id);
    if (reaction.emoji.name == 'jett_VALORANT')
        await member.roles.add('1232522262746497054');
    else if (reaction.emoji.name == 'cypher_VALORANT')
        await member.roles.add('1232523078899077181');
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
		}
	}
	const member = await reaction.message.guild.members.fetch(user.id);
	if (reaction.emoji.name == 'jett_VALORANT')
		await member.roles.remove('1232522262746497054');
	else if (reaction.emoji.name == 'cypher_VALORANT')
		await member.roles.remove('1232523078899077181');
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your app's token
client.login(token);
