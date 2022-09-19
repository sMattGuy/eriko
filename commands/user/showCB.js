const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showcb')
		.setDescription('Shows the leaderboard for a previous CB')
		.addIntegerOption(option => 
			option
				.setName('number')
				.setDescription('The number for the CB')
				.setRequired(true)),
	async execute(interaction){
		console.log(interaction.user.username + ' is checking specific CB leaderboard');
		await interaction.deferReply();
		let cbNumber = interaction.options.getInteger('number');
		//get config for that cb
		let cbConfig = await cb.findOne({where:{'cb_id': cbNumber, 'server_id': interaction.guild.id}});
		if(!cbConfig){
			console.log('No cb config found');
			const noDatabaseEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`That CB does not exist!`);
			interaction.editReply({embeds:[noDatabaseEmbed]});
			return;
		}
		//get all user data for that cb
		let userData = await todayshits.getAllHits(cbNumber, interaction.guild.id);
		if(userData.length == 0){
			console.log('No hits recorded for cb');
			const noDatabaseEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`CB ${cbNumber} has no recorded hits!`);
			interaction.editReply({embeds:[noDatabaseEmbed]});
			return;
		}
		let totalHits = 0;
		//initialize message so discord js doesn't crash
		for(let i=0;i<userData.length;i++){
			let usersHits = userData[i].n_hits;
			totalHits += usersHits;
			
			let userNick = await interaction.guild.members.fetch(userData[i].user_id).then(user => {return user.displayName}).catch(e => {return 'NoNameError'});
			let userObject = {name:userNick, hits:usersHits};
			userArray.push(userObject);
		}
		userArray.sort(function(a,b){
			return parseInt(b.hits) - parseInt(a.hits);
		});
		interaction.editReply(`Leaderboard for CB number ${cbNumber}\n`);
		let messageToSend = '';
		for(let i=0;i<userArray.length;i++){
			let messageAddition = `${userArray[i].name} : ${userArray[i].hits}\n`;
			if(messageToSend.length + messageAddition.length >= 2000){
				let messagePart = codeBlock(messageToSend);
				await interaction.followUp(messagePart);
				messageToSend = "";
			}
			messageToSend += messageAddition;
		}
		messageToSend += `Total : ${totalHits}`;
		messageToSend = codeBlock(messageToSend);
		await interaction.followUp(messageToSend);
		return;
		
	}
};