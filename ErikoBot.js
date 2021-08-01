'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
// Create an instance of a Discord client
const client = new Discord.Client();
// import token and database
const credentials = require('./auth.json');

//external variable that determins if the database has been reset today
let dailyReset = false;

//sets ready presense
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
	if(currentTime.getUTCHours() != 13){
		//if the current time does not equal 13 UTC (9am EST) then it will reset the daily reset checker to false
		//this is to prevent the issue where if a person was triggering the bot during 13 UTC it would be constantly resetting
		//the database, therefore clearing out an entire hours worth of work
		dailyReset = false;
	}
	//triggers at 9AM EST or 13 UTC
	if(currentTime.getUTCHours() == 13 && !dailyReset){
		if(!fs.existsSync(`./database.json`)){
			//if there is no database file, do nothing
			console.log('No database file found');
		}
		else{
			//this sets the daily reset flag to true, meaning that the daily reset has already occured, see above comment for
			//more information on why this is done
			dailyReset = true;
			//database read in local directory and parseing it into JSON object
			let dataRead = fs.readFileSync(`./database.json`);
			let dataJSON = JSON.parse(dataRead);
			//loop that iterates over all users and resets their daily hits to 0
			for(let i=0;i<dataJSON.users.length;i++){
				//actual setting of each user to 0
				dataJSON.users[i].hits = 0;
			}
			//JSON compression and sync file write to database file, overwritting it
			let dataSave = JSON.stringify(dataJSON);
			fs.writeFileSync(`./database.json`,dataSave);
		}
	}
	
	//start of user commands
	if(message.content === '!eriko hit'){
		//this command is used so that individual users can report that they have hit the boss
		//NOTE this bot has no way of actually verifying that the boss was actually hit, so it works on an honor system
		//possible update would be to somehow include a way of verifying interactions
		
		//stores the user id and name
		let hitUser = message.author.id;
		let hitUserName = message.author.username;
		//checks if database exists, if not it makes a new database file
		if(!fs.existsSync(`./database.json`)){
			//the database only contains a users array, if you want to add more to the database, this would be
			//crucial to edit so that new databases would have these features
			let newDatabaseFile = {users:[]};
			//JSON compression and file write
			let dataSave = JSON.stringify(newDatabaseFile);
			fs.writeFileSync(`./database.json`,dataSave);
		}
		//read the database file and parse it into JSON object
		let dataRead = fs.readFileSync(`./database.json`);
		let dataJSON = JSON.parse(dataRead);
		//flag that determins if a user exists within the database file, if this remains false then the user will be added at the end
		let userFound = false;
		//time recording for daily totals for user
		//this works by essentially creating PrST (Pricon Standard Time) where 9AM EST (13 UTC) is converted to 0 PrST
		if(currentTime.getUTCHours() < 13){
			//if the current time is between 0 UTC and 13 UTC, roll back 1 day
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables that pad zeros and un-zero index the month
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		//the date formatted as MMDDYYYY
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		for(let i=0;i<dataJSON.users.length;i++){
			//if we find the users ID in the database, we update their personal stats
			if(hitUser == dataJSON.users[i].id){
				//set our found flag to true to show that the user exists in the database and doesnt need to be added
				userFound = true;
				//check to see if the user has already done their 3 hits for today
				if(dataJSON.users[i].hits == 3){
					message.channel.send(`You have already hit 3 times today!`);
				}
				else{
					//increase the users daily hits
					dataJSON.users[i].hits += 1;
					//flag to search for todays hits, if its not found a new entry is made for today
					let foundDate = false;
					for(let j=0;j<dataJSON.users[i].total.length;j++){
						//the date was found
						if(dataJSON.users[i].total[j].date == formattedDate){
							//set our flag to true and update the hits for today
							//alternativly this can be done in the daily update section above where we set the hits back to 0
							//the only issue with doing that is that if someone called for the hits today at the current date it would show
							//up empty, despite people hitting today
							//this issue is only present if you consider that !eriko checkTodaysHits and !eriko checkHits MMDDYYYY will
							//always show the same information for the same day
							//to summerize: we can remove this and change it to updating in the daily reset section
							foundDate = true;
							dataJSON.users[i].total[j].hits += 1;
							break;
						}
					}
					if(!foundDate){
						//updates the user totals to the new date, see above on how this can be improved
						let newDailyHits = {'date':formattedDate,'hits':1};
						dataJSON.users[i].total.push(newDailyHits);
					}
					//alerts user
					message.channel.send(`You have hit the boss ${dataJSON.users[i].hits} time(s) today`);
					//updates database file
					let dataSave = JSON.stringify(dataJSON);
					fs.writeFileSync(`./database.json`,dataSave);
				}
				break;
			}
		}
		//new entry 
		if(!userFound){
			//this user object should be changed in the event that a new addition is made to the bot
			//simply tacking it on to the end should be fine
			let newUser = {'id':hitUser,'name':hitUserName,'hits':1,'total':[{'date':formattedDate,'hits':1}]};
			//update user file
			dataJSON.users.push(newUser);
			//write it all to the database
			let dataSave = JSON.stringify(dataJSON);
			fs.writeFileSync(`./database.json`,dataSave);
			//alert the user
			message.channel.send(`You have hit the boss 1 time today`);
		}
	}
	else if(message.content === '!eriko checkTodaysHits'){
		//display the all users hits for today
		if(!fs.existsSync(`./database.json`)){
			//if the file doesnt exist, do nothing and report it to console
			console.log('No database file found');
		}
		else{
			//read the file and parse it
			let dataRead = fs.readFileSync(`./database.json`);
			let dataJSON = JSON.parse(dataRead);
			//initialize the message with something, discord js crashes if an empty message is sent
			let messageToSend = `Todays hits\n`;
			for(let i=0;i<dataJSON.users.length;i++){
				//go through all users and display their name plus how many hits they've done today
				messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].hits}\n`;
			}
			//send resulting message to chat, as a code block for monospace font
			message.channel.send(messageToSend,{'code':true});
		}
	}
	// !eriko checkHits MMDDYYYY
	else if(message.content.startsWith('!eriko checkHits')){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3 || chop[2].length != 8){
			message.channel.send(`Usage: !eriko checkHits MMDDYYYY (For example: July 5 2021 UTC is 07052021)`);
		}
		else{
			//pull the final date part into a seperate variable
			let selectedDate = chop[chop.length-1];
			//check that the database exists
			if(!fs.existsSync(`./database.json`)){
				console.log('No database file found');
			}
			else{
				//read the database
				let dataRead = fs.readFileSync(`./database.json`);
				let dataJSON = JSON.parse(dataRead);
				//initialize message so discord js doesnt crash
				let messageToSend = `Hits for ${selectedDate}\n`;
				for(let i=0;i<dataJSON.users.length;i++){
					for(let j=0;j<dataJSON.users[i].total.length;j++){
						//if date is found using date code above, store it to the message
						if(selectedDate == dataJSON.users[i].total[j].date){
							messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].total[j].hits}\n`;
						}
						break;
					}
				}
				//send message as a code block
				message.channel.send(messageToSend,{'code':true});
			}
		}
	}
	//simple command that just tells users what today is in PrST
	else if(message.content === '!eriko today'){
		//this uses the same time conversion as above, so check there for the explination on PrST
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		
		message.channel.send(`Today's date is ${formattedDate}`);
	}
	//help menu, any new commands should be added to this for users sake
	else if(message.content === '!eriko help'){
		message.channel.send(`Use !eriko hit -> to count that you hit the boss for today!\nUse !eriko checkTodaysHits -> to see everyones hits for today!\nUse !eriko today -> to see what todays date is!\nUse !eriko checkHits <MMDDYYYY> -> to see the hits for a specific day! (Note though that the time is in UTC and the format is 07052021 for july 5th 2021)`);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);