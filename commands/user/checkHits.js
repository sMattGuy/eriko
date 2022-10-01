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
			//solve for date of cb
			cbConfig = await cb.getRecentServerConfig(interaction.guild.id);
			if(!cbConfig){
				console.log('No cb found');
				const noConfigEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`No CB data was found for this server!`);
				await interaction.editReply({embeds:[noConfigEmbed]});
				return;
			}
			if(parseInt(selectedDate) <= 0){
				console.log('Invalid day');
				const noConfigEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`Invalid day entered!`);
				await interaction.editReply({embeds:[noConfigEmbed]});
				return;
			}
			let savedTime = cbConfig.start_date;
			let savedEndTime = cbConfig.end_date;
			let startCB = new Date(`${savedTime.substring(0,2)}/${savedTime.substring(2,4)}/${savedTime.substring(4,8)}`);
			let endCB = new Date(`${savedEndTime.substring(0,2)}/${savedEndTime.substring(2,4)}/${savedEndTime.substring(4,8)}`);

			startCB.setUTCHours(13);
			startCB.setUTCMinutes(0);
			startCB.setUTCSeconds(0);
			startCB.setUTCMilliseconds(0);
			
			endCB.setUTCHours(13);
			endCB.setUTCMinutes(0);
			endCB.setUTCSeconds(0);
			endCB.setUTCMilliseconds(0);

			let lookDate = startCB;
			lookDate.setUTCDate(startCB.getUTCDate() + parseInt(selectedDate) - 1);
			console.log(`lookdate ${lookDate}`);
			console.log(`enddate ${endCB}`);
			if(lookDate > endCB){
				console.log('Invalid day');
				const noConfigEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`There is no data after the CB ended!`);
				await interaction.editReply({embeds:[noConfigEmbed]});
				return;
			}
			let currentDate = new Date();
			currentDate.setUTCHours(13);
			currentDate.setUTCMinutes(0);
			currentDate.setUTCSeconds(0);
			currentDate.setUTCMilliseconds(0);

			if(currentDate == lookDate){
				console.log('Invalid day');
				const noConfigEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`Use /checktodayshits!`);
				await interaction.editReply({embeds:[noConfigEmbed]});
				return;
			}
			let finalMonth = ('0'+(lookDate.getUTCMonth()+1)).slice(-2);
			let finalDay = ('0'+(lookDate.getUTCDate())).slice(-2);
			let finalDate = ""+finalMonth+finalDay+lookDate.getUTCFullYear();
			console.log(`final date: ${finalDate}`);
			//search for hits from that day
			userData = await todayshits.findAll({where:{'server_id': interaction.guild.id, 'date': finalDate}});
		}
		else{
			//date
			userData = await todayshits.findAll({where:{'server_id': interaction.guild.id, 'date': selectedDate}})
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
			if(!usersHits){
				usersHits = userData[i].hits;
			}
			totalHits += usersHits;
			let userNick = await interaction.guild.members.fetch(userData[i].user_id).then(user => {return user.displayName}).catch(e => {return `${userData[i].user_id}`});
			let userObject = {name:userNick,hits:usersHits};
			userArray.push(userObject);
		}
		userArray.sort(function(a,b){
			return parseInt(b.hits) - parseInt(a.hits);
		});
		
		await interaction.editReply(`Total  hits for ${selectedDate}\n`);
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
