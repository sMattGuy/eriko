'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
// Create an instance of a Discord client
const client = new Discord.Client();
// import token and database
const credentials = require('./auth.json');

//external variable that determines if the database has been reset today
let dayHasPassed = false;

client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name,command);
	}
}

const prefix = '!eriko';

//sets ready presence
client.on('ready', () => {
	client.user.setPresence({
		status: 'online',
		activity: {
			name: 'for !eriko help',
			type: "WATCHING"
		}
	});
	//list server in console
	client.guilds.cache.forEach(guild => {
		console.log(`${guild.name} | ${guild.id}`);
	});
	console.log('I am ready!');
});
// Create an event listener for messages
client.on('message', message => {
	//refreshes presence on bot
	client.user.setPresence({
		status: 'online',
		activity: {
			name: 'for !eriko help',
			type: "WATCHING"
		}
	});
	//checks for new day of clan battles
	let currentTime = new Date();	// this will update every time there is a message emitted, essentially working as a time of message
	
	//record the time of a command for debugging
	if(message.content.startsWith(prefix)){
		console.log(currentTime.getHours() + ':' + currentTime.getMinutes() + ' ' + (currentTime.getMonth()+1) + '/' + currentTime.getDate() + '/' + currentTime.getFullYear());
	}
	
	if(currentTime.getUTCHours() < 13 && !dayHasPassed){
		//if the current time does not equal 13 UTC (9am EST) then it will reset the daily reset checker to false
		//this is to prevent the issue where if a person was triggering the bot during 13 UTC it would be constantly resetting
		//the database, therefore clearing out an entire hours worth of work
		console.log('setting day has passed to true in time check');
		dayHasPassed = true;
	}
	
	//triggers at 9AM EST or 13 UTC
	if(currentTime.getUTCHours() >= 13 && dayHasPassed){
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
		}
		else{
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(!fs.existsSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//if there is no database file, do nothing
					console.log('No database file found');
				}
				else{
					//this sets the daily reset flag to true, meaning that the daily reset has already occurred, see above comment for
					//more information on why this is done
					console.log('setting day has passed to false in daily recording and reset')
					dayHasPassed = false;
					//database read in local directory and parsing it into JSON object
					let dataRead = fs.readFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					//loop that iterates over all users and resets their daily hits to 0
					for(let i=0;i<dataJSON.users.length;i++){
						console.log('updating hits for ' + dataJSON.users[i].name);
						//setting yesterdays hits
						currentTime.setDate(currentTime.getDate() - 1);
						//time variables that pad zeros and un-zero index the month
						let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
						let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
						//the date formatted as MMDDYYYY
						let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
						let hits = dataJSON.users[i].hits
						console.log('hits for ' + formattedDate + ' ' + hits);
						//create the input for the user
						let newDailyHits = {'date':formattedDate,'hits':hits};
						dataJSON.users[i].total.push(newDailyHits);
						
						//actual setting of each user to 0
						dataJSON.users[i].hits = 0;
					}
					//JSON compression and sync file write to database file, overwriting it
					let dataSave = JSON.stringify(dataJSON);
					fs.writeFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
				}
			}
		}
	}
	
	//start of user commands
	if(!message.content.startsWith(prefix) || message.author.bot)
		return;
	
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	
	if(!client.commands.has(commandName))
		return;
	
	const command = client.commands.get(commandName);
	
	try{
		command.execute(client,message);
	}
	catch(error){
		console.error(error);
		message.channel.send(`There was a problem executing that command!`);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
