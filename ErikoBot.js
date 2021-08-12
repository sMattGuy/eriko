'use strict';
// Import the discord.js module and others
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
// import token and database
const credentials = require('./auth.json');

//external variable that determines if the database has been reset today
let dayHasPassed = false;

client.commands = new Collection();

const commandFolders = fs.readdirSync('./commands');
const messageMap = new Map();

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name,command);
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

client.on('messageCreate', async message => {
	//haha funny
	if(messageMap.has(message.channel.id)){
		if(messageMap.get(message.channel.id).content == message.content && messageMap.get(message.channel.id).author != message.author.id){
			let messUpdate = messageMap.get(message.channel.id);
			messUpdate.times += 1;
			messUpdate.author = message.author.id;
			messageMap.set(message.channel.id,messUpdate);
			if(messUpdate.times == 3){
				message.channel.send(messUpdate.content);
				messageMap.delete(message.channel.id);
			}
		}
		else{
			messageMap.set(message.channel.id,{content:message.content,times:1,author:message.author.id});
		}
	}
	else{
		messageMap.set(message.channel.id,{content:message.content,times:1,author:message.author.id});
	}
	let currentTime = new Date();	// this will update every time there is a message emitted, essentially working as a time of message
	
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
			//setting yesterdays hits
			currentTime.setDate(currentTime.getDate() - 1);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//if there is no database file, do nothing
					console.log('No database file found');
				}
				else{
					//this sets the daily reset flag to true, meaning that the daily reset has already occurred, see above comment for
					//more information on why this is done
					console.log('setting day has passed to false in daily recording and reset')
					dayHasPassed = false;
					//database read in local directory and parsing it into JSON object
					let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					//loop that iterates over all users and resets their daily hits to 0
					for(let i=0;i<dataJSON.users.length;i++){
						console.log('updating hits for ' + dataJSON.users[i].name);
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
					fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
				}
			}
		}
	}
	
	if (message.content.toLowerCase() === '!eriko deploy' && message.author.id == '492850107038040095') {
		console.log('deploying commands');
		const data = [
		{
			name: 'contact',
			description: 'Gives you my contact information!',
		},
		{
			name: 'removehits',
			description: 'Removes a users hits for today',
			options: [{
				name: 'id',
				type: 'STRING',
				description: 'The users ID',
				required: true,
			}],
		},
		{
			name: 'startcb',
			description: 'Sets the start date for a Clan Battle',
			options: [{
				name: 'date',
				type: 'STRING',
				description: 'The start date in MMDDYYYY format',
				required: true,
			}],
		},
		{
			name: 'endcb',
			description: 'Sets the end date for a Clan Battle',
			options: [{
				name: 'date',
				type: 'STRING',
				description: 'The end date in MMDDYYYY format',
				required: true,
			}],
		},
		{
			name: 'hit',
			description: 'Records 1 to 3 hits for the day',
			options: [{
				name: 'hits',
				type: 'INTEGER',
				description: 'Enter 1, 2 or 3. This adds to your current hits',
				required: true,
				choices:[
					{
						name:'1',
						value:1
					},
					{
						name:'2',
						value:2
					},
					{
						name:'3',
						value:3
					},
				]
			}],
		},
		{
			name: 'nextcb',
			description: 'Shows how long until the next Clan Battle',
		},
		{
			name: 'today',
			description: 'Shows what today is in MMDDYYYY format and what day of the CB it is',
		},
		{
			name: 'checktodayshits',
			description: 'Shows todays hits',
		},
		{
			name: 'leaderboard',
			description: 'Shows everyones hits for the entire Clan Battle',
		},
		{
			name: 'checkhits',
			description: 'Shows the hits for a specific day',
			options: [{
				name: 'date',
				type: 'STRING',
				description: 'The MMDDYYYY/CB number',
				required: true,
			}],
		},
		];

		const command = await client.guilds.cache.get(message.guildId).commands.set(data);
		console.log(command);
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (!client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
