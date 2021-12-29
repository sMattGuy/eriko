const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'today',
	description: 'gets today',
	async execute(interaction){
		interaction.deferReply();
		console.log(interaction.user.username + ' is checking today\'s date');
		currentTime = new Date();
		//this uses the same time conversion as above, so check there for the explanation on PrST
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		//read the database
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == interaction.guild.id){
				//do numbers magic to figure out date diffs
				let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
				startCB.setUTCHours(13);
				startCB.setUTCMinutes(0);
				startCB.setUTCSeconds(0);
				startCB.setUTCMilliseconds(0);
				console.log(startCB);
				
				let timeDiff = currentTime.getTime() - startCB.getTime();
				let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				dayDiff += 1;
				const todayEmbed = new MessageEmbed()
					.setColor('#E3443B')
					.setDescription(`Today's date is ${formattedDate} (Day ${dayDiff} of CB)`);
				interaction.editReply({embeds:[todayEmbed]});
				break;
			}
		}
	}
};