const fs = require('fs');
const { MessageEmbed, Formatters } = require('discord.js');

module.exports = {
	name: 'showcb',
	description: 'shows everyones hits for a specific clan battle',
	async execute(interaction){
		console.log(interaction.user.username + ' is checking specific CB leaderboard');
		await interaction.deferReply();
		let cbNumber = interaction.options.getInteger('number');
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		//check that the database exists
		const databases = fs.readdirSync(`./databases/`).filter(file => file.includes(interaction.guild.id));
		let clanbattleData = 'nothing';
		for(const file of databases){
			let tempdata = fs.readFileSync(file);
			let tempJSON = JSON.parse(tempdata);
			if(tempJSON.num == cbNumber){
				clanbattleData = tempJSON;
				break;
			}
		}
		if(clanbattleData == 'nothing'){
			console.log('No database file found');
			const noDatabaseEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`No hits have been recorded`);
			interaction.editReply({embeds:[noDatabaseEmbed]});
			return;
		}
		else{
			let totalHits = 0;
			//initialize message so discord js doesn't crash
			let userArray = [];
			for(let i=0;i<clanbattleData.users.length;i++){
				let usersHits = clanbattleData.users[i].hits;
				totalHits += usersHits;
				for(let j=0;j<clanbattleData.users[i].total.length;j++){
					//if date is found using date code above, store it to the message
					usersHits += clanbattleData.users[i].total[j].hits;
					totalHits += clanbattleData.users[i].total[j].hits;
				}
				let userNick = await interaction.guild.members.fetch(clanbattleData.users[i].id).then(user => {return user.displayName}).catch(e => {return clanbattleData.users[i].name});
				let userObject = {name:userNick,hits:usersHits};
				userArray.push(userObject);
			}
			userArray.sort(function(a,b){
				return parseInt(b.hits) - parseInt(a.hits);
			});
			let messageToSend = `Leaderboard for CB number ${cbNumber}\n`;
			for(let i=0;i<userArray.length;i++){
				messageToSend += `${userArray[i].name} : ${userArray[i].hits}\n`;
			}
			messageToSend += `Total : ${totalHits}`;
			messageToSend = Formatters.codeBlock(messageToSend);
			await interaction.editReply(messageToSend);
			return;
		}
	}
};