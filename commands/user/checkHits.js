const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkhits')
		.setDescription('Shows the hits for a specific day')
		.addStringOption(option => 
			option
				.setName('date')
				.setDescription('The MMDDYYYY or CB number')
				.setRequired(true)),
	async execute(interaction){
		await interaction.deferReply();
		//pull the final date part into a separate variable
		let selectedDate = interaction.options.getString('date');
		console.log(interaction.user.username + ' is checking hits for ' + selectedDate);
		let totalHits = 0;
		
		let cbConfig = "";
		let userData = "";
		if(selectedDate.length != 8){
			//not a date
			cbConfig = await cb.findOne({where:{'server_id': interaction.guild.id, 'cb_id':parseInt(selectedDate)}});
			//get entire cb results
			userData = await todayshits.getAllHits(parseInt(selectedDate), interaction.guild.id);
		}
		else{
			//date
			cbConfig = await cb.findOne({where:{'server_id': interaction.guild.id, 'start_date':selectedDate}});
			userData = await todayshits.findAll({where:{'server_id': interaction.guild.id, 'date': selectedDate}})
		}

		if(!cbConfig){
			console.log('No config file found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		if(userData.length == 0){
			console.log('No user data found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`No hits were found for that day!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		
		let userArray = [];
		//initialize message so discord js doesn't crash
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
		
		interaction.editReply(`Total  hits for ${selectedDate}\n`);
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
}