const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { users, cb, todayshits } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sethits')
		.setDescription('Sets a users hits for the day')
		.addUserOption(option =>
			option
				.setName('id')
				.setDescription('The users ID')
				.setRequired(true))
		.addIntegerOption(option => 
			option
				.setName('hits')
				.setDescription('Enter 0, 1, 2 or 3')
				.setRequired(true)
				.addChoices(
					{name: '0', value: 0},
					{name: '1', value: 1},
					{name: '2', value: 2},
					{name: '3', value: 3},
				)),
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
		let user = interaction.options.getUser('id');
		let selectedUser = user.id;
		let newHits = interaction.options.getInteger('hits');
		console.log(interaction.user.username + ' is setting hits for id ' + selectedUser);
		//check that the database exists
		let cbConfig = await cb.findOne({where:{'server_id':interaction.guild.id}});
		if(!cbConfig){
			console.log('No config file found');
			const noConfigEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`No config for this server, ask a mod to create a CB!`);
			interaction.editReply({embeds:[noConfigEmbed]});
		}
		else{
			//read the database
			let userSearch = await users.findOne({where:{'user_id': selectedUser, 'server_id':interaction.guild.id}});
			if(userSearch){
				userSearch.hits = newHits;
				userSearch.save();
				let userNick = await interaction.guild.members.fetch(selectedUser).then(user => {return user.displayName});
				const removeEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`${userNick} has had their hits set to ${newHits}!`);
				interaction.editReply({embeds:[removeEmbed]});
				return;
			}
			else{
				const noUserEmbed = new EmbedBuilder()
					.setColor('#E3443B')
					.setDescription(`The user with ID ${selectedUser} does not exist in the database!`);
				interaction.editReply({embeds:[noUserEmbed]});
			}
		}
	}
};