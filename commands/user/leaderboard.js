const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows everyones hits for the entire Clan Battle'),
	async execute(interaction){
		console.log(interaction.user.username + ' is checking CB leaderboard');
		await interaction.deferReply();
		//grab config
		let cbConfig = await cb.getRecentServerConfig(interaction.guild.id);
		if(!cbConfig){
			console.log('No config file found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`No CB information is available!`);
			await interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}	
		//read the database
		let totalHits = 0;
		//initialize message so discord js doesn't crash
		let userData = await todayshits.getAllHits(cbConfig.recentCB, interaction.guild.id);
		if(userData.length == 0){
			console.log('No data found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`No CB information is available!`);
			await interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		let userArray = [];
		for(let i=0;i<userData.length;i++){
			let usersHits = userData[i].n_hits;
			totalHits += usersHits;
			let userNick = await interaction.guild.members.fetch(userData[i].user_id).then(user => {return user.displayName}).catch(e => {return 'NoNameError'});
			let userObject = {name:userNick,hits:usersHits};
			userArray.push(userObject);
		}
		userArray.sort(function(a,b){
			return parseInt(b.hits) - parseInt(a.hits);
		});
		
		await interaction.editReply(`Leaderboard for CB from ${cbConfig.start_date} to ${cbConfig.end_date}`);
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
