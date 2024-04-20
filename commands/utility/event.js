const { SlashCommandBuilder } = require('discord.js');



module.exports = {

    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Creates a server event')
        .addStringOption(option => option.setName('name').setDescription('Event name').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('Event date (YYYY-MM-DD)').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('Event time (HH:MM)').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Event description').setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');
        const description = interaction.options.getString('description');

        // Validate input
        if (!isValidDate(date) || !isValidTime(time)) {
            await interaction.reply('Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time.');
            return;
        }

        // Create event object
        const event = {
            name,
            datetime: new Date(`${date}T${time}:00`),
            description
        };

        // Process event creation (e.g., store in database, announce in channel)

        await interaction.reply(`@everyone, You are herby invited to "${name}" on ${date} at ${time}.`);
        
        createEvent(event);
    },
};



function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

function isValidTime(timeString) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeString);
}