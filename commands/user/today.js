const fs = require('fs');

module.exports = {
	name: 'today',
	description: 'gets today',
	execute(client,message){
		console.log(message.author.username + ' is checking today\'s date');
		currentTime = new Date();
		//this uses the same time conversion as above, so check there for the explanation on PrST
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		
		//read the database
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == message.guild.id){
				//do numbers magic to figure out date diffs
				let startCB = new Date(`${configJSON.servers[cfg].startCB.substring(0,2)}/${configJSON.servers[cfg].startCB.substring(2,4)}/${configJSON.servers[cfg].startCB.substring(4,8)}`);
				console.log(startCB);
				
				let timeDiff = currentTime.getTime() - startCB.getTime();
				let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
				dayDiff += 1;
				message.channel.send(`Today's date is ${formattedDate} (Day ${dayDiff} of CB)`);
				break;
			}
		}
	}
};