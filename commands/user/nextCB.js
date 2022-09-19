const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextcb')
		.setDescription('Shows how long until the next Clan Battle'),
	async execute(interaction){
		await interaction.deferReply();
		console.log(interaction.user.username + ' is checking start date of next cb');
		//check that the database exists
		let cbConfig = await cb.getRecentServerConfig(interaction.guild.id);
		if(!cbConfig){
			console.log('No config file found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`The next CB has not been set up!`);
			interaction.editReply({embeds:[noConfigEmbed]});
		}
		else{
			let currentTime = new Date();
			//read the database
			let savedStartDate = cbConfig.start_date;
			let startCB = new Date(`${savedStartDate.substring(0,2)}/${savedStartDate.substring(2,4)}/${savedStartDate.substring(4,8)}`);
			console.log(startCB);
			startCB.setUTCHours(13);
			startCB.setUTCMinutes(0);
			startCB.setUTCSeconds(0);
			startCB.setUTCMilliseconds(0);
			let timeDiff = startCB.getTime() - Date.now();
			let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
			dayDiff += 1;
			let dayResult = 'error';
			if(dayDiff <= 0){
				dayResult = `There is currently an active Clan Battle!`;
			}
			else{
				dayResult = `The next Clan Battle is in ${dayDiff} days!`;
			}
			const nextCBEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(dayResult);
			interaction.editReply({embeds:[nextCBEmbed]});
		}
	}
};