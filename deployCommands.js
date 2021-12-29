const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./auth.json');
const config = require('./config.json');

let clientID = config.clientID;
let guildIDs = config.servers;

const commands = [
	new SlashCommandBuilder()
		.setName('contact')
		.setDescription('Gives you my contact info!'),
	new SlashCommandBuilder()
		.setName('sethits')
		.setDescription('Sets a users hits for today')
		.addUserOption(option => 
			option
				.setName('id')
				.setDescription('The users ID')
				.setRequired(true))
		.addIntegerOption(option => 
			option
				.setName('hits')
				.setDescription('The number of hits')
				.addChoices([
					['1',1],
					['2',2],
					['3',3],
				])
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('setnumber')
		.setDescription('Sets the number for the current CB')
		.addIntegerOption(option => 
			option
				.setName('number')
				.setDescription('The CB number')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('showcb')
		.setDescription('Shows the leaderboard for a previous CB')
		.addIntegerOption(option => 
			option 
				.setName('number')
				.setDescription('The CB number')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('showhistory')
		.setDescription('Shows the history of CBs'),
	new SlashCommandBuilder()
		.setName('startcb')
		.setDescription('Sets the start date for a CB')
		.addStringOption(option => 
			option
				.setName('date')
				.setDescription('The start date in MMDDYYYY format')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('endcb')
		.setDescription('Sets the end date for a CB')
		.addStringOption(option => 
			option
				.setName('date')
				.setDescription('The end date in MMDDYYYY format')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('createcb')
		.setDescription('Creates a new CB database')
		.addStringOption(option => 
			option
				.setName('start')
				.setDescription('The start date in MMDDYYYY format')
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName('end')
				.setDescription('The end date in MMDDYYYY format')
				.setRequired(true))
		.addIntegerOption(option => 
			option 
				.setName('number')
				.setDescription('The CB number')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('hit')
		.setDescription('Records your hits for the day')
		.addIntegerOption(option => 
			option
				.setName('hits')
				.setDescription('The number of hits')
				.addChoices([
					['1',1],
					['2',2],
					['3',3],
				])
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('nextcb')
		.setDescription('Shows how long until the next CB'),
	new SlashCommandBuilder()
		.setName('today')
		.setDescription('Shows what today is in MMDDYYYY format and the CB day'),
	new SlashCommandBuilder()
		.setName('checktodayshits')
		.setDescription('Shows todays hits'),
	new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows everyones hits for the entire CB'),
	new SlashCommandBuilder()
		.setName('checkhits')
		.setDescription('Shows the hits for a specific day in the current CB')
		.addStringOption(option => 
			option 
				.setName('date')
				.setDescription('The MMDDYYYY/CB number')
				.setRequired(true)),
]
.map(command => command.toJSON());

const rest = new REST({version:'9'}).setToken(token);

for(let i=0;i<guildIDs.length;i++){
	rest.put(Routes.applicationGuildCommands(clientID,guildIDs[i].id),{body:commands})
		.then(() => console.log('Registered application commands!'))
		.catch(console.error);
}