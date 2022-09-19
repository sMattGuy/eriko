const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createcb')
		.setDescription('Creates a new Clan Battle')
		.addStringOption(option => 
			option
				.setName('start')
				.setDescription('The start date in MMDDYYYY format')
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName('end')
				.setDescription('The end date in MMDDYYYY format')
				.setRequired(true))
		.addIntegerOption(option => 
			option
				.setName('number')
				.setDescription('The number of the Clan Battle')
				.setRequired(true)),
	async execute(interaction){
		await interaction.deferReply();
		if(!interaction.member.roles.cache.has('815669639107051552') && !interaction.member.roles.cache.has('815669643648827452') && !interaction.member.roles.cache.has('872981028262801448') && !interaction.guild.ownerId === interaction.user.id){
			const invalidPermissions = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`You do not have permission to use this command!`);
			interaction.editReply({embeds:[invalidPermissions]});
			return;
		}
		//pull the final date part into a separate variable
		let startDate = interaction.options.getString('start');
		let endDate = interaction.options.getString('end');
		let cbNumber = interaction.options.getInteger('number');
		if(startDate.length != 8 || endDate.length != 8){
			const invalidFormatEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`Make sure your date is in MMDDYYYY format!`);
			interaction.editReply({embeds:[invalidFormatEmbed]});
			return;
		}
		if(cbNumber <= 0){
			const invalidNumberEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`Make sure your CB Number is correct!`);
			interaction.editReply({embeds:[invalidNumberEmbed]});
			return;
		}
		console.log(interaction.user.username + ' is creating the CB ' + startDate + ' ' + endDate + ' ' + cbNumber);
		let cbConfig = await cb.findOne({where:{'server_id':interaction.guild.id,'cb_id': cbNumber}});
		if(cbConfig){
			//update existing value
			cbConfig.start_date = startDate;
			cbConfig.end_date = endDate;
			cbConfig.save();
		}
		else{
			cb.create({'server_id': interaction.guild.id, 'cb_id': cbNumber, 'start_date': startDate, 'end_date': endDate});
		}
		const setStartEmbed = new EmbedBuilder()
			.setColor('#E3443B')
			.setDescription(`CB number ${cbNumber} has been created with start date ${startDate} and end date ${endDate}`);
		interaction.editReply({embeds:[setStartEmbed]});
	}
};