const fs = require('fs');
const { MessageEmbed, Formatters } = require('discord.js');

module.exports = {
	name: 'showhistory',
	description: 'shows everyones hits for a specific clan battle',
	async execute(interaction){
		console.log(interaction.user.username + ' is checking CB history');
		await interaction.deferReply();
		let configRead = fs.readFileSync(`./config.json`);
		let configJSON = JSON.parse(configRead);
		//check that the database exists
		const databases = fs.readdirSync(`./databases/`).filter(file => file.includes(interaction.guild.id));
		let clanbattleData = 'nothing';
		let messageToSend = '';
		for(const file of databases){
			clanbattleData = 'gotten';
			let tempdata = fs.readFileSync(`./databases/${file}`);
			let tempJSON = JSON.parse(tempdata);
			
			let CBNum = tempJSON.num;
			let startDate = file.substring(0,8);
			let endDate = file.substring(file.length-13,file.length-5);
			
			messageToSend += `Clan Battle: ${CBNum}, Started: ${startDate}, Ended: ${endDate}\n`;
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
			messageToSend = Formatters.codeBlock(messageToSend);
			await interaction.editReply(messageToSend);
			return;
		}
	}
};