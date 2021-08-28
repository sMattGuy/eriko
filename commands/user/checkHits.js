const fs = require('fs');
const { MessageEmbed, Formatters } = require('discord.js');

module.exports = {
	name: 'checkhits',
	description: 'check specific days hits',
	async execute(interaction){
		//pull the final date part into a separate variable
		let selectedDate = interaction.options.getString('date');
		console.log(interaction.user.username + ' is checking hits for ' + selectedDate);
		let totalHits = 0;
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.reply({embeds:[noConfigEmbed]});
			return;
		}
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == interaction.guild.id){
				//check that the database exists
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					console.log('No database file found');
					const noDatabaseEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`No hits have been recorded`);
					interaction.reply({embeds:[noDatabaseEmbed]});
					return;
				}
				else{
					let channel = interaction.channel;
					interaction.reply('Getting hits together');
					//read the database
					let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					//do numbers magic to figure out date diffs
					let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
					console.log(startCB);
					let endCB = new Date(`${configJSON.servers[cfg].endCB.substring(0,2)}/${configJSON.servers[cfg].endCB.substring(2,4)}/${configJSON.servers[cfg].endCB.substring(4,8)}`);
					
					let lookDate = '';
					if(selectedDate.length >= 1 && selectedDate.length < 8){
						if(selectedDate <= 0){
							const beforeStartErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data from before the Clan Battle started!`);
							interaction.reply({embeds:[beforeStartErrorEmbed]});
							return;
						}
						//user is searching by CB day
						lookDate = new Date();
						lookDate.setDate(startCB.getDate() + parseInt(selectedDate) - 1);
						if(lookDate > endCB){
							const afterEndErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data for after the Clan Battle has ended!`);
							interaction.reply({embeds:[afterEndErrorEmbed]});
							return;
						}
						let currentTime = new Date();
						if(lookDate > currentTime){
							const futureDataErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data for the future yet!`);
							interaction.reply({embeds:[futureDataErrorEmbed]});
							return;
						}
						if((lookDate.getFullYear() == currentTime.getFullYear())&&(lookDate.getMonth() == currentTime.getMonth())&&(lookDate.getDate() == currentTime.getDate())){
							const todayCheckErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`Use /checktodayshits instead!`);
							interaction.reply({embeds:[todayCheckErrorEmbed]});
							return;
						}
						let recordMonth = ('0' + (lookDate.getUTCMonth()+1)).slice(-2);
						let recordDay = ('0' + lookDate.getUTCDate()).slice(-2);
						selectedDate = "" + recordMonth + recordDay + lookDate.getUTCFullYear();
					}
					else{
						//user is searching by MMDDYYYY
						lookDate = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
						if(lookDate < startCB){
							const beforeStartErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data from before the Clan Battle started!`);
							interaction.reply({embeds:[beforeStartErrorEmbed]});
							return;
						}
						if(lookDate > endCB){
							const afterEndErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data for after the Clan Battle has ended!`);
							interaction.reply({embeds:[afterEndErrorEmbed]});
							return;
						}
						let currentTime = new Date();
						if(lookDate > currentTime){
							const futureDataErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`There is no data for the future yet!`);
							interaction.reply({embeds:[futureDataErrorEmbed]});
							return;
						}
						if((lookDate.getFullYear() == currentTime.getFullYear())&&(lookDate.getMonth() == currentTime.getMonth())&&(lookDate.getDate() == currentTime.getDate())){
							const todayCheckErrorEmbed = new MessageEmbed()
								.setColor('#E3443B')
								.setDescription(`Use /checktodayshits instead!`);
							interaction.reply({embeds:[todayCheckErrorEmbed]});
							return;
						}
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
								let userNick = await interaction.guild.members.fetch(dataJSON.users[i].id).then(user => {return user.displayName});
								messageToSend += `${userNick} : ${dataJSON.users[i].total[j].hits}\n`;
								break;
							}
						}
					}
					messageToSend += `Total for ${selectedDate} : ${totalHits}`;
					messageToSend = Formatters.codeBlock(messageToSend);
					//send message as a code block
					channel.send(messageToSend);
					return;
				}
				break;
			}
		}
		const noConfigEmbed = new MessageEmbed()
			.setColor('#E3443B')
			.setDescription(`Configuration for this server has not been set up!`);
		interaction.reply({embeds:[noConfigEmbed]});
	}
};