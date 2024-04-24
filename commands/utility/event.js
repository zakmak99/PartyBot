const { SlashCommandBuilder } = require('discord.js');
const { google } = require('googleapis');
const credentials = require('../../key/credentials.json');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Creates a server event')
        .addStringOption(option => option.setName('name').setDescription('Event name').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('Event date (YYYY-MM-DD)').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('Event time (HH:MM 24 hour formatting)').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Event description').setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');
        const description = interaction.options.getString('description');

        // Validate input
        if (!isValidDate(date) || !isValidTime(time)) {
            return;
        }

        // Create event object
        const eventData = [name, date, time, description];

       

        // Process event creation (e.g., store in database, announce in channel)
        await interaction.reply(`@everyone, You are herby invited to "${name}" on ${date} at ${time}.`);
        
        await createEvent(eventData);
    },
};


//Initialize google sheets api
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

//set spreadsheet
const spreadsheetId = '14dRDdcrgSCRcVQshzuI_gy8_EONAoCeApFiEy1qAHl8';
async function createEvent(eventData) {
    try {
        console.log('Event Data:', eventData);
        // Append the event data to sheet
        const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [eventData],
            },
        });


        console.log('Event created:', appendResponse.data);
        return appendResponse.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}

  
   function isValidDate(dateString) {
    // Check if the date string matches the YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
       if (!regex.test(dateString)) {
           interaction.reply('Invalid date format. Please Use YYYY-MM-DD');
           return false;
       }

    // Check if the date is not in the past
    const currentDate = new Date();
    const inputDate = new Date(dateString);
       if (inputDate < currentDate) {
           interaction.reply('Entered date is in the past');
           return false;
       }

    // Check if the month is valid (1 to 12)
    const month = parseInt(dateString.split('-')[1], 10);
       if (month < 1 || month > 12) {
           interaction.reply('Please use a valid month(1-12)');
           return false;
       }

    return true;
}

    function isValidTime(timeString) {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(timeString)) {
            interaction.reply('Invalid time format. Please use HH:MM 24 hour formating');
            return false;
        };
        return true;
    }
