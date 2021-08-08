const fs = require('fs');

module.exports = {
	name: 'checktodayshits',
	description: 'gets todays hits',
	execute(interaction){
		//display the all users hits for today
		console.log(interaction.user.username + ' is checking todays hits');
		if(!fs.existsSync(`./config.json`)){
			console.log('no config file found');
			interaction.reply(`No dates have been created for the CB!`);
			return;
		}
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == interaction.guild.id){
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					//if the file doesn't exist, do nothing and report it to console
					console.log('No database file found');
					interaction.reply(`No hits have been recorded`);
				}
				else{
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
						messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].hits}\n`;
					}
					messageToSend += `Total for today : ${totalHits}\n${hourDiff}:${minDiff} left today`;
					//send resulting message to chat, as a code block for mono space font
					interaction.reply(messageToSend,{'code':true});
				}
				break;
			}
		}
	}
};