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
	let currentTime = new Date();
	if(currentTime.getUTCHours() != 13){
		dailyReset = false;
	}
	if(currentTime.getUTCHours() == 13 && !dailyReset){
		if(!fs.existsSync(`./database.json`)){
			console.log('No database file found');
		}
		else{
			dailyReset = true;
			let dataRead = fs.readFileSync(`./database.json`);
			let dataJSON = JSON.parse(dataRead);
			for(let i=0;i<dataJSON.users.length;i++){
				dataJSON.users[i].hits = 0;
			}
			let dataSave = JSON.stringify(dataJSON);
			fs.writeFileSync(`./database.json`,dataSave);
		}
	}
	
	//start of user commands
	if(message.content === '!eriko hit'){
		let hitUser = message.author.id;
		let hitUserName = message.author.username;
		if(!fs.existsSync(`./database.json`)){
			let newDatabaseFile = {users:[]};
			let dataSave = JSON.stringify(newDatabaseFile);
			fs.writeFileSync(`./database.json`,dataSave);
		}
		let dataRead = fs.readFileSync(`./database.json`);
		let dataJSON = JSON.parse(dataRead);
		let userFound = false;
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		for(let i=0;i<dataJSON.users.length;i++){
			if(hitUser == dataJSON.users[i].id){
				userFound = true;
				if(dataJSON.users[i].hits == 3){
					message.channel.send(`You have already hit 3 times today!`);
				}
				else{
					dataJSON.users[i].hits += 1;
					let foundDate = false;
					for(let j=0;j<dataJSON.users[i].total.length;j++){
						if(dataJSON.users[i].total[j].date == formattedDate){
							foundDate = true;
							dataJSON.users[i].total[j].hits += 1;
							break;
						}
					}
					if(!foundDate){
						let newDailyHits = {'date':formattedDate,'hits':1};
						dataJSON.users[i].total.push(newDailyHits);
					}
					message.channel.send(`You have hit the boss! You have hit the boss ${dataJSON.users[i].hits} today`);
					let dataSave = JSON.stringify(dataJSON);
					fs.writeFileSync(`./database.json`,dataSave);
				}
				break;
			}
		}
		//new entry 
		if(!userFound){
			let newUser = {'id':hitUser,'name':hitUserName,'hits':1,'total':[{'date':formattedDate,'hits':1}]};
			dataJSON.users.push(newUser);
			let dataSave = JSON.stringify(dataJSON);
			fs.writeFileSync(`./database.json`,dataSave);
			message.channel.send(`You have hit the boss! You have hit the boss 1 today`);
		}
	}
	else if(message.content === '!eriko checkTodaysHits'){
		//display the all users hits for today
		if(!fs.existsSync(`./database.json`)){
			console.log('No database file found');
		}
		else{
			dailyReset = true;
			let dataRead = fs.readFileSync(`./database.json`);
			let dataJSON = JSON.parse(dataRead);
			let messageToSend = `Todays hits\n`;
			for(let i=0;i<dataJSON.users.length;i++){
				messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].hits}\n`;
			}
			message.channel.send(messageToSend,{'code':true});
		}
	}
	// !eriko checkHits MMDDYYYY
	else if(message.content.startsWith('!eriko checkHits')){
		let chop = message.content.split(" ");
		if(chop.length != 3){
			message.channel.send(`Usage: !eriko checkHits MMDDYYYY (ie July 5 2021 UTC is 07052021)`);
		}
		else{
			let selectedDate = chop[chop.length-1];
			//display the all users hits for today
			if(!fs.existsSync(`./database.json`)){
				console.log('No database file found');
			}
			else{
				dailyReset = true;
				let dataRead = fs.readFileSync(`./database.json`);
				let dataJSON = JSON.parse(dataRead);
				let messageToSend = `Hits for ${selectedDate}\n`;
				for(let i=0;i<dataJSON.users.length;i++){
					for(let j=0;j<dataJSON.users[i].total.length;j++){
						if(selectedDate == dataJSON.users[i].total[j].date){
							messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].total[j].hits}\n`;
						}
						break;
					}
				}
				message.channel.send(messageToSend,{'code':true});
			}
		}
	}
	else if(message.content === '!eriko today'){
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		
		message.channel.send(`Todays date is ${formattedDate}`);
	}
	else if(message.content === '!eriko help'){
		message.channel.send(`Use !eriko hit  to account that you hit the boss for today!\nUse !eriko checkTodaysHits  to see everyones hits for today!\nUse !eriko today  to see what todays date format is for your convience\nUse !eriko checkHits <MMDDYYYY> to see the hits for a specific day, note though that the time is in UTC and the format is 07052021 for july 5th 2021`);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);