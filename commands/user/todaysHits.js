const { EmbedBuilder, codeBlock, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checktodayshits')
		.setDescription('Shows todays hits'),
	async execute(interaction){
		//display the all users hits for today
		console.log(interaction.user.username + ' is checking todays hits');
		await interaction.deferReply();
		//get user database
		let userList = await users.getCreditedHits(interaction.guild.id);
		if(userList.length == 0){
			console.log('No valid users found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`This CB has no valid users!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		let channel = interaction.channel;
		let currentTime = new Date();
		let nextEnd = new Date();
		console.log(currentTime);
		nextEnd.setUTCDate(nextEnd.getUTCDate() + 1);
		console.log(nextEnd);
		nextEnd.setUTCHours(13);
		nextEnd.setUTCMinutes(0);
		nextEnd.setUTCSeconds(0);
		console.log(nextEnd);
		let msDiff = nextEnd.getTime() - Date.now();
		let hourDiff = Math.floor((msDiff % 86400000) / 3600000);
		let minDiff = Math.round(((msDiff % 86400000) % 3600000) / 60000);
		
		//initialize the message with something, discord js crashes if an empty message is sent
		let totalHits = 0;
		let userArray = [];
		for(let i=0;i<userList.length;i++){
			//go through all users and display their name plus how many hits they've done today
			totalHits += userList[i].hits;
			let userNick = await interaction.guild.members.fetch(userList[i].user_id).then(user => {return user.displayName}).catch(e => {return 'NameFindError'});
			let userObject = {name:userNick,hits:userList[i].hits};
			userArray.push(userObject);
		}
		userArray.sort(function(a,b){
			return a.name.localeCompare(b.name);
		});
		let messageToSend = `Today's hits\n`;
		for(let i=0;i<userArray.length;i++){
			messageToSend += `${userArray[i].name} : ${userArray[i].hits}\n`;
		}
		messageToSend += `Total for today : ${totalHits}\n${hourDiff}:${minDiff} left today`;
		messageToSend = codeBlock(messageToSend);
		//send resulting message to chat, as a code block for mono space font
		interaction.editReply(messageToSend);
	}
};
