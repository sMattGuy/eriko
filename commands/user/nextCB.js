const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'nextcb',
	description: 'gets the days left until the next CB',
	async execute(interaction){
		await interaction.deferReply();
		console.log(interaction.user.username + ' is checking start date of next cb');
		//check that the database exists
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
		}
		else{
			let currentTime = new Date();
			//read the database
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(configJSON.servers[cfg].id == interaction.guild.id){
					let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
					console.log(startCB);
					startCB.setUTCHours(13);
					startCB.setUTCMinutes(0);
					startCB.setUTCSeconds(0);
					startCB.setUTCMilliseconds(0);
					let timeDiff = startCB.getTime() - Date.now();
					let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
					dayDiff += 1;
					let dayResult = 'error';
					if(dayDiff <= 0){
						dayResult = `There is currently an active Clan Battle!`;
					}
					else{
						dayResult = `The next Clan Battle is in ${dayDiff} days!`;
					}
					const nextCBEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(dayResult);
					interaction.editReply({embeds:[nextCBEmbed]});
					break;
				}
			}
		}
	}
};