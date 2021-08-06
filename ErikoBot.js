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

//constants that will make future updates easier
const MAXHITS = 3;

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
	if(message.content.startsWith('!eriko')){
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
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		if(!fs.existsSync(`./${configJSON.startCB}database.json${configJSON.endCB}`)){
			//if there is no database file, do nothing
			console.log('No database file found');
		}
		else{
			//this sets the daily reset flag to true, meaning that the daily reset has already occurred, see above comment for
			//more information on why this is done
			console.log('setting day has passed to false in daily recording and reset')
			dayHasPassed = false;
			//database read in local directory and parsing it into JSON object
			let dataRead = fs.readFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`);
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
			fs.writeFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`,dataSave);
		}
	}
	
	//start of user commands
	if(message.content.startsWith('!eriko hit')){
		//this command is used so that individual users can report that they have hit the boss
		//NOTE this bot has no way of actually verifying that the boss was actually hit, so it works on an honor system
		//possible update would be to somehow include a way of verifying interactions
		let hitAmount = 1;
		console.log(message.author.username + ' is hitting the boss');
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length > 3){
			message.channel.send(`Usage: !eriko hit <blank or 1-3>`);
			return;
		}
		if(chop.length == 3){
			hitAmount = parseInt(chop[chop.length-1]);
			if(isNaN(hitAmount) || hitAmount > MAXHITS || hitAmount < 1){
				message.channel.send(`Invalid amount entered! Either enter nothing or 1-3 based on how many hits you have done!`);
				return;
			}
		}
		//stores the user id and name
		let hitUser = message.author.id;
		let hitUserName = message.author.username;
		//checks if database exists, if not it makes a new database file
		if(!fs.existsSync(`./${configJSON.startCB}database${configJSON.endCB}.json`)){
			//the database only contains a users array, if you want to add more to the database, this would be
			//crucial to edit so that new databases would have these features
			let newDatabaseFile = {users:[]};
			//JSON compression and file write
			let dataSave = JSON.stringify(newDatabaseFile);
			fs.writeFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`,dataSave);
		}
		//read the database file and parse it into JSON object
		let dataRead = fs.readFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`);
		let dataJSON = JSON.parse(dataRead);
		//flag that determines if a user exists within the database file, if this remains false then the user will be added at the end
		let userFound = false;
		//time recording for daily totals for user
		//this works by essentially creating PrST (Pricon Standard Time) where 9AM EST (13 UTC) is converted to 0 PrST
		for(let i=0;i<dataJSON.users.length;i++){
			//if we find the users ID in the database, we update their personal stats
			if(hitUser == dataJSON.users[i].id){
				//set our found flag to true to show that the user exists in the database and doesn't need to be added
				userFound = true;
				//check to see if the user has already done their 3 hits for today
				if(dataJSON.users[i].hits == MAXHITS){
					console.log(message.author.username + ' has hit the max times day');
					message.channel.send(`You have already hit ${MAXHITS} times today!`);
				}
				else if(dataJSON.users[i].hits + hitAmount > MAXHITS){
					message.channel.send(`Invalid amount entered! You already recorded ${dataJSON.users[i].hits} hit(s) today, ${hitAmount} puts you over ${MAXHITS} hits!`);
				}
				else{
					//increase the users daily hits
					dataJSON.users[i].hits += hitAmount;
					//alerts user
					message.channel.send(`You have hit the boss ${dataJSON.users[i].hits} time(s) today`);
					//updates database file
					let dataSave = JSON.stringify(dataJSON);
					fs.writeFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`,dataSave);
				}
				break;
			}
		}
		//new entry 
		if(!userFound){
			//this user object should be changed in the event that a new addition is made to the bot
			if(hitAmount > MAXHITS){
				//if they enter more than MAXHITS 
				message.channel.send(`Invalid amount entered! You already recorded 0 hit(s) today, ${hitAmount} puts you over ${MAXHITS} hits!`);
			}
			else{
				//simply tacking it on to the end should be fine
				let newUser = {'id':hitUser,'name':hitUserName,'hits':hitAmount,'total':[]};
				//update user file
				dataJSON.users.push(newUser);
				//write it all to the database
				let dataSave = JSON.stringify(dataJSON);
				fs.writeFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`,dataSave);
				//alert the user
				message.channel.send(`You have hit the boss ${hitAmount} time(s) today!`);
			}
		}
	}
	
	else if(message.content === '!eriko checkTodaysHits'){
		//display the all users hits for today
		console.log(message.author.username + ' is checking todays hits');
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		if(!fs.existsSync(`./${configJSON.startCB}database${configJSON.endCB}.json`)){
			//if the file doesn't exist, do nothing and report it to console
			console.log('No database file found');
		}
		else{
			//read the file and parse it
			let dataRead = fs.readFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`);
			let dataJSON = JSON.parse(dataRead);
			//initialize the message with something, discord js crashes if an empty message is sent
			let totalHits = 0;
			let messageToSend = `Today's hits\n`;
			for(let i=0;i<dataJSON.users.length;i++){
				//go through all users and display their name plus how many hits they've done today
				totalHits += dataJSON.users[i].hits;
				messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].hits}\n`;
			}
			messageToSend += `Total for today : ${totalHits}`;
			//send resulting message to chat, as a code block for mono space font
			message.channel.send(messageToSend,{'code':true});
		}
	}
	
	// !eriko checkHits MMDDYYYY or !eriko checkHits CBDay
	else if(message.content.startsWith('!eriko checkHits')){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3 || (chop[2].length != 8 && chop[2].length != 1)){
			message.channel.send(`Usage: !eriko checkHits MMDDYYYY or CB day(For example: July 5 2021 UTC is 07052021)`);
		}
		else{
			//pull the final date part into a separate variable
			let selectedDate = chop[chop.length-1];
			console.log(message.author.username + ' is checking hits for ' + selectedDate);
			let totalHits = 0;
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			//check that the database exists
			if(!fs.existsSync(`./${configJSON.startCB}database${configJSON.endCB}.json`)){
				console.log('No database file found');
			}
			else{
				//read the database
				let dataRead = fs.readFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`);
				let dataJSON = JSON.parse(dataRead);
				//do numbers magic to figure out date diffs
				let startCB = new Date(`${configJSON.startCB.substring(0,2)}/${configJSON.startCB.substring(2,4)}/${configJSON.startCB.substring(4,8)}`);
				console.log(startCB);
				
				let lookDate = '';
				if(chop[2].length == 1){
					//user is searching by CB day
					lookDate = new Date();
					lookDate.setDate(startCB.getDate() + parseInt(selectedDate) - 1);
					
					let recordMonth = ('0' + (lookDate.getUTCMonth()+1)).slice(-2);
					let recordDay = ('0' + lookDate.getUTCDate()).slice(-2);
					selectedDate = "" + recordMonth + recordDay + lookDate.getUTCFullYear();
				}
				else{
					//user is searching by MMDDYYYY
					lookDate = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
				}
				
				let timeDiff = lookDate.getTime() - startCB.getTime();
				let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				dayDiff += 1;
				
				//initialize message so discord js doesn't crash
				let messageToSend = `Hits for ${selectedDate} (Day ${dayDiff} of CB)\n`;
				for(let i=0;i<dataJSON.users.length;i++){
					for(let j=0;j<dataJSON.users[i].total.length;j++){
						//if date is found using date code above, store it to the message
						if(selectedDate == dataJSON.users[i].total[j].date){
							totalHits += dataJSON.users[i].total[j].hits;
							messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].total[j].hits}\n`;
							break;
						}
					}
				}
				messageToSend += `Total for ${selectedDate} : ${totalHits}`;
				//send message as a code block
				message.channel.send(messageToSend,{'code':true});
			}
		}
	}
	
	//simple command that just tells users what today is in PrST
	else if(message.content === '!eriko today'){
		console.log(message.author.username + ' is checking today\'s date');
		//this uses the same time conversion as above, so check there for the explanation on PrST
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		
		//read the database
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		
		//do numbers magic to figure out date diffs
		let startCB = new Date(`${configJSON.startCB.substring(0,2)}/${configJSON.startCB.substring(2,4)}/${configJSON.startCB.substring(4,8)}`);
		console.log(startCB);
		
		let timeDiff = currentTime.getTime() - startCB.getTime();
		let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
		dayDiff += 1;
		message.channel.send(`Today's date is ${formattedDate} (Day ${dayDiff} of CB)`);
	}
	
	//command that will state the start of a clan battle at a specific time
	// !eriko startCB MMDDYYYY
	else if(message.content.startsWith('!eriko startCB') && (message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id)){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3 || chop[2].length != 8){
			message.channel.send(`Usage: !eriko startCB MMDDYYYY (For example: July 5 2021 UTC is 07052021)`);
		}
		else{
			//pull the final date part into a separate variable
			let selectedDate = chop[chop.length-1];
			console.log(message.author.username + ' is setting the CB start for ' + selectedDate);
			//check that the database exists
			if(!fs.existsSync(`./config.json`)){
				console.log('No config file found');
			}
			else{
				//read the database
				let configRead = fs.readFileSync(`./config.json`);
				let configJSON = JSON.parse(configRead);
				
				//writes the start of CB
				configJSON.startCB = selectedDate;
				
				//writes to database
				let configSave = JSON.stringify(configJSON);
				fs.writeFileSync(`./config.json`,configSave);
				message.channel.send(`The CB start date has been set to ${selectedDate}`);
			}
		}
	}
	
	//command that will state the end of a clan battle at a specific time
	// !eriko endCB MMDDYYYY
	else if(message.content.startsWith('!eriko endCB') && (message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id)){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3 || chop[2].length != 8){
			message.channel.send(`Usage: !eriko endCB MMDDYYYY (For example: July 5 2021 UTC is 07052021)`);
		}
		else{
			//pull the final date part into a separate variable
			let selectedDate = chop[chop.length-1];
			console.log(message.author.username + ' is setting the CB end for ' + selectedDate);
			//check that the database exists
			if(!fs.existsSync(`./config.json`)){
				console.log('No config file found');
			}
			else{
				//read the database
				let configRead = fs.readFileSync(`./config.json`);
				let configJSON = JSON.parse(configRead);
				
				let startCB = new Date(`${configJSON.startCB.substring(0,2)}/${configJSON.startCB.substring(2,4)}/${configJSON.startCB.substring(4,8)}`);
				console.log(startCB);
				
				let endCB = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
				console.log(endCB);
				
				if(endCB.getTime() - startCB.getTime() < 0){
					message.channel.send(`End time cannot be before the start time!`);
					return;
				}
				
				//writes the end of CB
				configJSON.endCB = selectedDate;
				
				//writes to database
				let configSave = JSON.stringify(configJSON);
				fs.writeFileSync(`./config.json`,configSave);
				
				message.channel.send(`The CB end date has been set to ${selectedDate}`)
			}
		}
	}
	
	// !eriko removeHits userID
	else if(message.content.startsWith('!eriko removeHits') && (message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id)){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3){
			message.channel.send(`Usage: !eriko removeHits <userID>`);
		}
		else{
			//pull the final date part into a separate variable
			let selectedUser = chop[chop.length-1];
			console.log(message.author.username + ' is removing hits for id ' + selectedUser);
			//check that the database exists
			if(!fs.existsSync(`./config.json`)){
				console.log('No config file found');
			}
			else{
				//read the database
				let configRead = fs.readFileSync(`./config.json`);
				let configJSON = JSON.parse(configRead);
				
				if(!fs.existsSync(`./${configJSON.startCB}database${configJSON.endCB}.json`)){
					console.log('No database file found');
				}
				else{
					let dataRead = fs.readFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					
					for(let i=0;i<dataJSON.users.length;i++){
						if(dataJSON.users[i].id == selectedUser){
							dataJSON.users[i].hits = 0;
							let dataSave = JSON.stringify(dataJSON);
							fs.writeFileSync(`./${configJSON.startCB}database${configJSON.endCB}.json`,dataSave);
							message.channel.send(`${dataJSON.users[i].name} has had their hits set to 0!`);
							break;
						}
					}
				}
			}
		}
	}
	
	// !eriko nextCB
	else if(message.content === '!eriko nextCB'){
		console.log(message.author.username + ' is checking start date of next cb');
		//check that the database exists
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
		}
		else{
			//read the database
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			
			let startCB = new Date(`${configJSON.startCB.substring(0,2)}/${configJSON.startCB.substring(2,4)}/${configJSON.startCB.substring(4,8)}`);
			console.log(startCB);
			
			let timeDiff = startCB.getTime() - currentTime.getTime();
			let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
			dayDiff += 1;
			
			if(dayDiff < 0){
				message.channel.send(`There is currently an active Clan Battle!`);
			}
			else{
				message.channel.send(`The next Clan Battle is in ${dayDiff} days!`);
			}
		}
	}
	else if(message.content === '!eriko contact'){
		message.channel.send(`MattGuy#4376  -> I makea the bot mama mia`);
	}
	else if(message.content === '!eriko modHelp' && (message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id)){
		console.log(message.author.username + ' is checking help');
		message.channel.send(`\nUse !eriko startCB <MMDDYYYY> -> to set the start date for the CB\nUse !eriko endCB <MMDDYYYY> -> to set the end of a clan battle\nUse !eriko removeHits <userID> -> to remove a users hits for today`);
	}
	//help menu, any new commands should be added to this for users sake
	else if(message.content === '!eriko help'){
		console.log(message.author.username + ' is checking help');
		message.channel.send(`Use !eriko hit <blank or 1-${MAXHITS}> -> to count that you hit the boss for today!\nUse !eriko checkTodaysHits -> to see everyone's hits for today!\nUse !eriko today -> to see what today's date is!\nUse !eriko checkHits <MMDDYYYY / CBDay> -> to see the hits for a specific day! (Note though that the time is in UTC and the format is 07052021 for July 5th 2021)\n!eriko contact -> give remarks here\nUse !eriko nextCB -> to see the date of the next CB`);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
