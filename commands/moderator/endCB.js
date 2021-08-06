const fs = require('fs');

module.exports = {
	name: 'endcb',
	description: 'sets the end date of a CB',
	execute(client,message){
		if(message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id){
			//chop up the message into individual parts based on spaces
			let chop = message.content.split(" ");
			//check if the length and size of the message is okay
			if(chop.length != 3 || chop[2].length != 8){
				message.channel.send(`Usage: !eriko endCB MMDDYYYY (For example: July 5 2021 UTC is 07052021)`);
			}
			else{
				//pull the final date part into a separate variable
				let selectedDate = chop[chop.length-1];
				console.log(message.author.username + ' is setting the CB end for ' + selectedDate);
				//check that the database exists
				if(!fs.existsSync(`./config.json`)){
					console.log('No config file found, making new one');
					let newConfig = {servers:[]};
					let configSave = JSON.stringify(newConfig);
					fs.writeFileSync(`./config.json`,configSave);
				}
				//read the database
				let configRead = fs.readFileSync(`./config.json`);
				let configJSON = JSON.parse(configRead);
				let guildID = message.guild.id;
				
				let foundConfig = false;
				for(let i=0;i<configJSON.servers.length;i++){
					if(configJSON.servers[i].id == guildID){
						foundConfig = true;
						let startCB = new Date(`${configJSON.servers[i].startCB.substring(0,2)}/${configJSON.servers[i].startCB.substring(2,4)}/${configJSON.servers[i].startCB.substring(4,8)}`);
						console.log(startCB);
						
						let endCB = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
						console.log(endCB);
						
						if(endCB.getTime() - startCB.getTime() < 0){
							message.channel.send(`End time cannot be before the start time!`);
							return;
						}
						
						//writes the end of CB
						configJSON.servers[i].endCB = selectedDate;
						break;
					}
				}
				if(!foundConfig){
					//new config entry
					let newConfigEntry = {'id':guildID,startCB:'00000000',endCB:selectedDate};
					configJSON.servers.push(newConfigEntry);
				}
				
				
				//writes to database
				let configSave = JSON.stringify(configJSON);
				fs.writeFileSync(`./config.json`,configSave);
				
				message.channel.send(`The CB end date has been set to ${selectedDate}`)
			}
		}
		else{
			message.channel.send(`You do not have permission to use that command!`);
		}
	}
};