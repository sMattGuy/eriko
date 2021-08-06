const fs = require('fs');

const MAXHITS = 3;

module.exports = {
	name: 'hit',
	description: 'command for registering a git',
	execute(client,message){
		//this command is used so that individual users can report that they have hit the boss
		//NOTE this bot has no way of actually verifying that the boss was actually hit, so it works on an honor system
		//possible update would be to somehow include a way of verifying interactions
		let hitAmount = 1;
		console.log(message.author.username + ' is hitting the boss');
		if(!fs.existsSync(`./config.json`)){
			message.channel.send(`A moderator has not yet set up the beginning and end of the Clan Battle!`);
			return;
		}
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
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == message.guild.id){
				let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
				let endCB = new Date(`${configJSON.servers[cfg].endCB.substring(0,2)}/${configJSON.servers[cfg].endCB.substring(2,4)}/${configJSON.servers[cfg].endCB.substring(4,8)}`);
				console.log(startCB);
				console.log(endCB);
				let currentTime = new Date();
				let timeDiff = startCB.getTime() - currentTime.getTime();
				let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				
				if(dayDiff > 0){
					message.channel.send(`The next Clan Battle is in ${dayDiff} days!`);
					return;
				}
				timeDiff = endCB.getTime() - currentTime.getTime();
				dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				if(dayDiff < 0){
					message.channel.send(`The clan battle has already passed!`);
					return;
				}
				
				if(!fs.existsSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//the database only contains a users array, if you want to add more to the database, this would be
					//crucial to edit so that new databases would have these features
					let newDatabaseFile = {users:[]};
					//JSON compression and file write
					let dataSave = JSON.stringify(newDatabaseFile);
					fs.writeFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
				}
				//read the database file and parse it into JSON object
				let dataRead = fs.readFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`);
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
							fs.writeFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
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
						fs.writeFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
						//alert the user
						message.channel.send(`You have hit the boss ${hitAmount} time(s) today!`);
					}
				}
				break;
			}
		}
	}
};