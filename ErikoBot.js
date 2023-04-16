'use strict';
// Import the discord.js module and others
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
// Create an instance of a Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
// import token and database
const credentials = require('./auth.json');
// database objects
const { users, cb, todayshits } = require('./dbObjects.js');
// cron function 
const cron = require('cron');
//external variable that determines if the database has been reset today
let dayHasPassed = false;

client.commands = new Collection();

const commandFolders = fs.readdirSync('./commands');
const messageMap = new Map();

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.data.name, command);
	}
}

//sets ready presence
client.on('ready', async () => {
	client.user.setPresence({
		status: 'online'
	});
	//list server in console
	client.guilds.cache.forEach(async guild => {
		console.log(`${guild.name} | ${guild.id}`);
	});
	console.log('I am ready!');
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if(!command) return;
	try{
		await command.execute(interaction);
	} catch(error){
		console.error(error);
		await interaction.followUp({content:'There was an error with this command!',ephemeral:true});
	}
});
//0 13 * * *
let dailyActivity = new cron.CronJob('0 13 * * *', async () => {
	//triggers at 9AM EST or 13 UTC
	let currentTime = new Date();
	console.log('running the daily at ' + currentTime)
	currentTime.setDate(currentTime.getDate() - 1);
	//setting yesterdays hits
	//loop that iterates over all users and resets their daily hits to 0
	let serverUsers = await users.findAll();
	for(let i=0;i<serverUsers.length;i++){
		let cbNumber = await cb.getRecentServerConfig(serverUsers[i].server_id);
		//time variables that pad zeros and un-zero index the month
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		//the date formatted as MMDDYYYY
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		let hits = serverUsers[i].hits;
		//create the input for the user
		if(hits != 0){
			console.log('hits for ' + formattedDate + ' ' + hits);
			console.log('updating hits for ' + serverUsers[i].user_id);
			let result = await todayshits.create({'user_id': serverUsers[i].user_id, 'server_id': serverUsers[i].server_id, 'date': formattedDate, 'hits':hits, 'cb': cbNumber.recentCB});
		}
		//actual setting of each user to 0
		serverUsers[i].hits = 0;
		serverUsers[i].save();
	}
},null,null,null,null,null,0);
dailyActivity.start();

client.login(`${credentials.token}`);
