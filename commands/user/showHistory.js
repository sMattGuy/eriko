const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showhistory')
		.setDescription('Shows the history of CBs'),
	async execute(interaction){
		console.log(interaction.user.username + ' is checking CB history');
		await interaction.deferReply();
		//check that the database exists
		let cbHistory = await cb.findAll({where:{'server_id': interaction.guild.id}});
		if(!cbHistory){
			console.log('No database file found');
			const noDatabaseEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`No data have been recorded!`);
			interaction.editReply({embeds:[noDatabaseEmbed]});
			return;
		}
		
		let messageToSend = '';
		interaction.editReply('Clan Battle History');
		for(let i=0;i<cbHistory.length;i++){
			let messageAddition = `Clan Battle: ${cbHistory[i].cb_id}, Started: ${cbHistory[i].start_date}, Ended: ${cbHistory[i].end_date}\n`;
			if(messageToSend.length + messageAddition.length >= 2000){
				let midMessage = codeBlock(messageToSend);
				await interaction.followUp(messageToSend);
				messageToSend = '';
			}
			messageToSend += messageAddition;
		}
		messageToSend = codeBlock(messageToSend);
		await interaction.followUp(messageToSend);
		return;
	}
};