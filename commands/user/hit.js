const fs = require('fs');
const { MessageEmbed } = require('discord.js');

const MAXHITS = 3;

module.exports = {
	name: 'hit',
	description: 'command for registering a git',
	execute(interaction){
		//this command is used so that individual users can report that they have hit the boss
		//NOTE this bot has no way of actually verifying that the boss was actually hit, so it works on an honor system
		//possible update would be to somehow include a way of verifying interactions
		let hitAmount = interaction.options.getInteger('hits');
		if(hitAmount > 3 || hitAmount <= 0){
			const invalidHitsEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`You can only hit the boss 1 to 3 times!`);
			interaction.reply({embeds:[invalidHitsEmbed]});
			return;
		}
		console.log(interaction.user.username + ' is hitting the boss');
		if(!fs.existsSync(`./config.json`)){
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`A moderator has not yet set up the beginning and end of the Clan Battle!`);
			interaction.reply({embeds:[noConfigEmbed]});
			return;
		}
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		
		//stores the user id and name
		let hitUser = interaction.user.id;
		let hitUserName = interaction.user.username;
		//checks if database exists, if not it makes a new database file
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == interaction.guild.id){
				let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
				let endCB = new Date(`${configJSON.servers[cfg].endCB.substring(0,2)}/${configJSON.servers[cfg].endCB.substring(2,4)}/${configJSON.servers[cfg].endCB.substring(4,8)}`);
				console.log(startCB);
				console.log(endCB);
				let currentTime = new Date();
				let timeDiff = startCB.getTime() - currentTime.getTime();
				let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				
				if(dayDiff > 0){
					const invalidStartEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`The next Clan Battle is in ${dayDiff} days!`);
					interaction.reply({embeds:[invalidStartEmbed]});
					return;
				}
				timeDiff = endCB.getTime() - currentTime.getTime();
				dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				if(dayDiff <= 0){
					const invalidEndEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`The clan battle has already passed!`);
					interaction.reply({embeds:[invalidEndEmbed]});
					return;
				}
				
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//the database only contains a users array, if you want to add more to the database, this would be
					//crucial to edit so that new databases would have these features
					let newDatabaseFile = {users:[]};
					//JSON compression and file write
					let dataSave = JSON.stringify(newDatabaseFile);
					fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
				}
				//read the database file and parse it into JSON object
				let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
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
							console.log(interaction.user.username + ' has hit the max times day');
							const maxHitsEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`You have already hit ${MAXHITS} times today!`);
							interaction.reply({embeds:[maxHitsEmbed]});
							return;
						}
						else if(dataJSON.users[i].hits + hitAmount > MAXHITS){
							const overMaxHitsEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`Invalid amount entered! You already recorded ${dataJSON.users[i].hits} hit(s) today, ${hitAmount} puts you over ${MAXHITS} hits!`);
							interaction.reply({embeds:[overMaxHitsEmbed]});
							return;
						}
						else{
							//increase the users daily hits
							dataJSON.users[i].hits += hitAmount;
							//alerts user
							const hitsEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`You have hit the boss ${dataJSON.users[i].hits} time(s) today`);
							interaction.reply({embeds:[hitsEmbed]});
							//updates database file
							let dataSave = JSON.stringify(dataJSON);
							fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
							return;
						}
						break;
					}
				}
				//new entry 
				if(!userFound){
					//this user object should be changed in the event that a new addition is made to the bot
					//simply tacking it on to the end should be fine
					let newUser = {'id':hitUser,'name':hitUserName,'hits':hitAmount,'total':[]};
					//update user file
					dataJSON.users.push(newUser);
					//write it all to the database
					let dataSave = JSON.stringify(dataJSON);
					fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
					//alert the user
					const hitsEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`You have hit the boss ${hitAmount} time(s) today!`);
					interaction.reply({embeds:[hitsEmbed]});
					return;
				}
				break;
			}
		}
		const noDatabaseEmbed = new MessageEmbed()
			.setColor('#E3443B')
			.setDescription(`Database file does not exist`);
		interaction.reply({embeds:[noDatabaseEmbed]});
	}
};