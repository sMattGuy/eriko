const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('today')
		.setDescription('Shows what today is in MMDDYYYY format and what day of the CB it is'),
	async execute(interaction){
		await interaction.deferReply();
		console.log(interaction.user.username + ' is checking today\'s date');
		currentTime = new Date();
		//this uses the same time conversion as above, so check there for the explanation on PrST
		if(currentTime.getUTCHours() < 13){
			currentTime.setDate(currentTime.getDate() - 1);
		}
		//time variables
		let recordMonth = ('0' + (currentTime.getUTCMonth()+1)).slice(-2);
		let recordDay = ('0' + currentTime.getUTCDate()).slice(-2);
		let formattedDate = "" + recordMonth + recordDay + currentTime.getUTCFullYear();
		let cbConfig = await cb.getRecentServerConfig(interaction.guild.id);
		if(!cbConfig){
			console.log('No config file found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		//read the database
		//do numbers magic to figure out date diffs
		let savedTime = cbConfig.start_date;
		let startCB = new Date(`${savedTime.substring(0,2)}/${savedTime.substring(2,4)}/${savedTime.substring(4,8)}`);
		startCB.setUTCHours(13);
		startCB.setUTCMinutes(0);
		startCB.setUTCSeconds(0);
		startCB.setUTCMilliseconds(0);
		console.log(startCB);
		
		let timeDiff = currentTime.getTime() - startCB.getTime();
		let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
		dayDiff += 1;
		const todayEmbed = new EmbedBuilder()
			.setColor('#E3443B')
			.setDescription(`Today's date is ${formattedDate} (Day ${dayDiff} of CB)`);
		interaction.editReply({embeds:[todayEmbed]});
	}
};