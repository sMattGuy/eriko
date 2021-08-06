const fs = require('fs');

module.exports = {
	name: 'startcb',
	description: 'sets the start of a CB',
	execute(client,message){
		if(message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id){
			//chop up the message into individual parts based on spaces
			let chop = message.content.split(" ");
			//check if the length and size of the message is okay
			if(chop.length != 3 || chop[2].length != 8){
				message.channel.send(`Usage: !eriko startCB MMDDYYYY (For example: July 5 2021 UTC is 07052021)`);
			}
			else{
				//pull the final date part into a separate variable
				let selectedDate = chop[chop.length-1];
				console.log(message.author.username + ' is setting the CB start for ' + selectedDate);
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
				//writes the start of CB
				let foundConfig = false;
				for(let i=0;i<configJSON.servers.length;i++){
					if(configJSON.servers[i].id == guildID){
						foundConfig = true;
						configJSON.servers[i].startCB = selectedDate;
						break;
					}
				}
				if(!foundConfig){
					//new config entry
					let newConfigEntry = {'id':guildID,startCB:selectedDate,endCB:'00000000'};
					configJSON.servers.push(newConfigEntry);
				}
				
				//writes to database
				let configSave = JSON.stringify(configJSON);
				fs.writeFileSync(`./config.json`,configSave);
				message.channel.send(`The CB start date has been set to ${selectedDate}`);
			}
		}
		else{
			message.channel.send(`You do not have permission to use this command!`);
		}
	}
};