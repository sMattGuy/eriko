const fs = require('fs');
const { MessageEmbed, Formatters } = require('discord.js');

module.exports = {
	name: 'leaderboard',
	description: 'shows everyones hits for the entire clan battle',
	async execute(interaction){
		await interaction.reply('Working on it...');
		console.log(interaction.user.username + ' is checking CB leaderboard');
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		let channel = interaction.channel;
		for(let cfg=0;cfg<configJSON.servers.length;cfg++){
			if(configJSON.servers[cfg].id == interaction.guild.id){
				//check that the database exists
				if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
					console.log('No database file found');
					const noDatabaseEmbed = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`No hits have been recorded`);
					interaction.editReply({embeds:[noDatabaseEmbed]});
					return;
				}
				else{
					//read the database
					let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
					let dataJSON = JSON.parse(dataRead);
					let totalHits = 0;
					//initialize message so discord js doesn't crash
					let userArray = [];
					for(let i=0;i<dataJSON.users.length;i++){
						let usersHits = dataJSON.users[i].hits;
						totalHits += usersHits;
						for(let j=0;j<dataJSON.users[i].total.length;j++){
							//if date is found using date code above, store it to the message
							usersHits += dataJSON.users[i].total[j].hits;
							totalHits += dataJSON.users[i].total[j].hits;
						}
						let userNick = await interaction.guild.members.fetch(dataJSON.users[i].id).then(user => {return user.displayName}).catch(e => {return dataJSON.users[i].name});
						let userObject = {name:userNick,hits:usersHits};
						userArray.push(userObject);
					}
					userArray.sort(function(a,b){
						return parseInt(b.hits) - parseInt(a.hits);
					});
					let messageToSend = `Leaderboard for CB from ${configJSON.servers[cfg].startCB} to ${configJSON.servers[cfg].endCB}\n`;
					for(let i=0;i<userArray.length;i++){
						messageToSend += `${userArray[i].name} : ${userArray[i].hits}\n`;
					}
					messageToSend += `Total : ${totalHits}`;
					messageToSend = Formatters.codeBlock(messageToSend);
					await interaction.editReply(messageToSend);
					return;
				}
			}
		}
		const noConfigEmbed = new MessageEmbed()
			.setColor('#E3443B')
			.setDescription(`Configuration for this server has not been set up!`);
		interaction.editReply({embeds:[noConfigEmbed]});
	}
};
