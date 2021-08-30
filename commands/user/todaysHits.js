const fs = require('fs');
const { MessageEmbed, Formatters } = require('discord.js');

module.exports = {
	name: 'checktodayshits',
	description: 'gets todays hits',
	async execute(interaction){
		//display the all users hits for today
		console.log(interaction.user.username + ' is checking todays hits');
		if(!fs.existsSync(`./config.json`)){
			console.log('no config file found');
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
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//if the file doesn't exist, do nothing and report it to console
					console.log('No database file found');
					const noDatabaseEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`No hits have been recorded`);
					interaction.reply({embeds:[noDatabaseEmbed]});
				}
				else{
					let channel = interaction.channel;
					await interaction.deferReply({ ephemeral: true });
					let currentTime = new Date();
					let nextEnd = new Date();
					console.log(currentTime);
					nextEnd.setUTCDate(nextEnd.getUTCDate() + 1);
					console.log(nextEnd);
					nextEnd.setUTCHours(13);
					nextEnd.setUTCMinutes(0);
					nextEnd.setUTCSeconds(0);
					console.log(nextEnd);
					let msDiff = nextEnd.getTime() - currentTime.getTime();
					let hourDiff = Math.floor((msDiff % 86400000) / 3600000);
					let minDiff = Math.round(((msDiff % 86400000) % 3600000) / 60000);
					
					//read the file and parse it
					let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					//initialize the message with something, discord js crashes if an empty message is sent
					let totalHits = 0;
					let messageToSend = `Today's hits\n`;
					for(let i=0;i<dataJSON.users.length;i++){
						//go through all users and display their name plus how many hits they've done today
						totalHits += dataJSON.users[i].hits;
						let userNick = await interaction.guild.members.fetch(dataJSON.users[i].id).then(user => {return user.displayName});
						messageToSend += `${userNick} : ${dataJSON.users[i].hits}\n`;
					}
					messageToSend += `Total for today : ${totalHits}\n${hourDiff}:${minDiff} left today`;
					messageToSend = Formatters.codeBlock(messageToSend);
					//send resulting message to chat, as a code block for mono space font
					interaction.editReply(messageToSend);
				}
				break;
			}
		}
	}
};