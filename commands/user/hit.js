const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits, times } = require('../../dbObjects.js');

const MAXHITS = 3;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hit')
		.setDescription('Records 1 to 3 hits for the day')
		.addIntegerOption(option => 
			option
				.setName('hits')
				.setDescription('Enter 1, 2 or 3. This will set your current hits')
				.setRequired(true)
				.addChoices(
					{name: '1', value: 1},
					{name: '2', value: 2},
					{name: '3', value: 3},
				)),
	async execute(interaction){
		await interaction.deferReply();
		//this command is used so that individual users can report that they have hit the boss
		//NOTE this bot has no way of actually verifying that the boss was actually hit, so it works on an honor system
		//possible update would be to somehow include a way of verifying interactions
		let hitAmount = interaction.options.getInteger('hits');
		console.log(interaction.user.username + ' is hitting the boss');
		//get server config
		let cbConfig = await cb.getRecentServerConfig(interaction.guild.id);
		if(!cbConfig){
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`A moderator has not yet set up a Clan Battle!`);
			interaction.editReply({embeds:[noConfigEmbed]});
			return;
		}
		
		//stores the user id and name
		let hitUser = interaction.user.id;
		let hitUserName = interaction.user.username;
		//checks if database exists, if not it makes a new database file
		
		let startCB = new Date(`${cbConfig.start_date.substring(0,2)}/${cbConfig.start_date.substring(2,4)}/${cbConfig.start_date.substring(4,8)}`);
		startCB.setUTCHours(13);
		startCB.setUTCMinutes(0);
		startCB.setUTCSeconds(0);
		startCB.setUTCMilliseconds(0);
		let endCB = new Date(`${cbConfig.end_date.substring(0,2)}/${cbConfig.end_date.substring(2,4)}/${cbConfig.end_date.substring(4,8)}`);
		endCB.setUTCHours(13);
		endCB.setUTCMinutes(0);
		endCB.setUTCSeconds(0);
		endCB.setUTCMilliseconds(0);
		console.log(startCB);
		console.log(endCB);
		let currentTime = new Date();
		let timeDiff = startCB.getTime() - Date.now();
		let dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
		
		if(timeDiff >= 0){
			const invalidStartEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`The next Clan Battle is in ${dayDiff} days!`);
			interaction.editReply({embeds:[invalidStartEmbed]});
			return;
		}
		timeDiff = endCB.getTime() - Date.now();
		dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
		if(timeDiff <= 0){
			const invalidEndEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`The clan battle has already passed!`);
			interaction.editReply({embeds:[invalidEndEmbed]});
			return;
		}
		
		let userData = await users.findOne({where:{'user_id': hitUser, 'server_id': interaction.guild.id}});

		if(userData){
			//update user
			userData.hits = hitAmount;
			await userData.save();
		}
		else{
			//new entry
			await users.create({'user_id': hitUser, 'server_id': interaction.guild.id, 'hits': hitAmount});
		}
		let stringDate = '' + Date.now();
		await times.create({'user_id': hitUser, 'server_id': interaction.guild.id, 'hits': hitAmount, 'times': stringDate, 'cb': cbConfig.recentCB});
		//alerts user
		const hitsEmbed = new EmbedBuilder()
			.setColor('#E3443B')
			.setDescription(`You have recorded ${hitAmount} hit(s) for today!`);
		await interaction.editReply({embeds:[hitsEmbed]});
		return;
	}
}
