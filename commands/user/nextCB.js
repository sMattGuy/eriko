const fs = require('fs');

module.exports = {
	name: 'nextcb',
	description: 'gets the days left until the next CB',
	execute(client,message){
		console.log(message.author.username + ' is checking start date of next cb');
		//check that the database exists
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
		}
		else{
			let currentTime = new Date();
			//read the database
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(configJSON.servers[cfg].id == message.guild.id){
					let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
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
					break;
				}
			}
		}
	}
};