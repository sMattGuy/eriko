const fs = require('fs');

module.exports = {
	name: 'removehits',
	description: 'removes a users hits for that day',
	execute(client,message){
		if(message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id){
			//chop up the message into individual parts based on spaces
			let chop = message.content.split(" ");
			//check if the length and size of the message is okay
			if(chop.length != 3){
				message.channel.send(`Usage: !eriko removeHits <userID>`);
			}
			else{
				//pull the final date part into a separate variable
				let selectedUser = chop[chop.length-1];
				console.log(message.author.username + ' is removing hits for id ' + selectedUser);
				//check that the database exists
				if(!fs.existsSync(`./config.json`)){
					console.log('No config file found');
				}
				else{
					//read the database
					let configRead = fs.readFileSync(`./config.json`);
					let configJSON = JSON.parse(configRead);
					for(let cfg=0;cfg<configJSON.servers.length;cfg++){
						if(configJSON.servers[cfg].id == message.guild.id){
							if(!fs.existsSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`)){
								console.log('No database file found');
							}
							else{
								let dataRead = fs.readFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`);
								let dataJSON = JSON.parse(dataRead);
								
								for(let i=0;i<dataJSON.users.length;i++){
									if(dataJSON.users[i].id == selectedUser){
										dataJSON.users[i].hits = 0;
										let dataSave = JSON.stringify(dataJSON);
										fs.writeFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
										message.channel.send(`${dataJSON.users[i].name} has had their hits set to 0!`);
										break;
									}
								}
							}
							break;
						}
					}
				}
			}
		}
		else{
			message.channel.send(`You do not have permission to use that command!`);
		}
	}
};