const fs = require('fs');

module.exports = {
	name: 'checkhits',
	description: 'check specific days hits',
	execute(client,message){
		//chop up the message into individual parts based on spaces
		let chop = message.content.split(" ");
		//check if the length and size of the message is okay
		if(chop.length != 3 || (chop[2].length != 8 && chop[2].length != 1)){
			message.channel.send(`Usage: !eriko checkHits MMDDYYYY or CB day(For example: July 5 2021 UTC is 07052021)`);
		}
		else{
			//pull the final date part into a separate variable
			let selectedDate = chop[chop.length-1];
			console.log(message.author.username + ' is checking hits for ' + selectedDate);
			let totalHits = 0;
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(configJSON.servers[cfg].id == message.guild.id){
					//check that the database exists
					if(!fs.existsSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`)){
						console.log('No database file found');
					}
					else{
						//read the database
						let dataRead = fs.readFileSync(`./${configJSON.servers[cfg].startCB}${message.guild.id}${configJSON.servers[cfg].endCB}.json`);
						let dataJSON = JSON.parse(dataRead);
						//do numbers magic to figure out date diffs
						let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
						console.log(startCB);
						
						let lookDate = '';
						if(chop[2].length == 1){
							//user is searching by CB day
							lookDate = new Date();
							lookDate.setDate(startCB.getDate() + parseInt(selectedDate) - 1);
							
							let recordMonth = ('0' + (lookDate.getUTCMonth()+1)).slice(-2);
							let recordDay = ('0' + lookDate.getUTCDate()).slice(-2);
							selectedDate = "" + recordMonth + recordDay + lookDate.getUTCFullYear();
						}
						else{
							//user is searching by MMDDYYYY
							lookDate = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
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
									messageToSend += `${dataJSON.users[i].name} : ${dataJSON.users[i].total[j].hits}\n`;
									break;
								}
							}
						}
						messageToSend += `Total for ${selectedDate} : ${totalHits}`;
						//send message as a code block
						message.channel.send(messageToSend,{'code':true});
					}
					break;
				}
			}
		}
	}
};