const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const cron = require('node-cron');
const { google } = require('googleapis');
const credentials = require('./key/credentials.json');
const moment = require('moment');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '14dRDdcrgSCRcVQshzuI_gy8_EONAoCeApFiEy1qAHl8';

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



cron.schedule('0 * * * *', async () => { 
    console.log('Running event check...');
    const announcementsChannel = client.channels.cache.get('802807718850854913');
    try {
        // Fetch events from the spreadsheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:E', 
        });
        const events = response.data.values; 

        const currentDate = moment();
        date = currentDate.format('YYYY-MM-DD');
        console.log('curent date is ', date);

        // Loop through each event
        for (const event of events) {
            console.log('counting');
            const eventName = event[0];
            const eventDate = moment(event[1]);
            const eventTime = moment(event[2], 'HH:mm');

            // Calculate the time difference between the current date and the event date
            const daysDifference = eventDate.diff(currentDate.format('YYYY-MM-DD'), 'days');
            console.log(daysDifference);
            // Calculate the time difference between the current time and the event time
            const timeDifference = eventTime.diff(currentDate, 'minutes');
            console.log(timeDifference);
            // If the event is scheduled within an hour and on the same day, announce it
            if (daysDifference === 0 && timeDifference > 0 && timeDifference <= 60) {
                console.log('posting');
                const formattedTime = eventTime.format('HH:mm');
                await announcementsChannel.send(`@everyone, Reminder: "${eventName}" starts at ${formattedTime}.`);
            }
        }
    } catch (error) {
        console.error('Error checking events:', error);
    }
});




client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your app's token
client.login(token);
