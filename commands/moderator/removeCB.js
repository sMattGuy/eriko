const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { users, cb, todayshits, times } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removecb')
		.setDescription('Removes a Clan Battle and all data with it!')
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
		let cbNumber = interaction.options.getInteger('number');
		if(cbNumber <= 0){
			const invalidNumberEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`Make sure your CB Number is correct!`);
			interaction.editReply({embeds:[invalidNumberEmbed]});
			return;
		}
		console.log(interaction.user.username + ' is removing  the CB ' + cbNumber);
		
		let cbResults = await cb.count({where:{'server_id':interaction.guild.id,'cb_id': cbNumber}});
		let todayResults = await todayshits.count({where:{'server_id':interaction.guild.id,'cb': cbNumber}});
		let timeResults = await times.count({where:{'server_id':interaction.guild.id,'cb': cbNumber}});
		let userResults = await users.getCreditedHits(interaction.guild.id);
		
		let total = cbResults + todayResults + timeResults + userResults.length;
		const acceptButton = new ButtonBuilder()
			.setCustomId('deleteRows')
			.setLabel('Delete Rows')
			.setStyle(ButtonStyle.Danger);
		const refuseButton = new ButtonBuilder()
			.setCustomId('backOut')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);
		
		const row = new ActionRowBuilder()
			.addComponents(
				acceptButton,
				refuseButton,
			);
			
		const setStartEmbed = new EmbedBuilder()
			.setColor('#E3443B')
			.setDescription(`WARNING!!! THIS OPERATION WILL DELETE:\n${cbResults} ROWS FROM CBCONFIG\n${todayResults} ROWS FROM TODAYSHITS\n${timeResults} ROWS FROM TIMES\n${userResults.length} USERS HITS WILL BE WIPED FOR TODAY (EVEN IF NOT SAME CB!)\nARE YOU SURE YOU WANT TO CONTINUE?`);
		interaction.editReply({embeds:[setStartEmbed],components: [row]});
		
		const filter = i => (i.customId === 'deleteRows' || i.customId === 'backOut') && i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
		
		collector.once('collect', async i => {
			if(i.customId == 'deleteRows'){
				await cb.destroy({where:{'server_id':interaction.guild.id,'cb_id': cbNumber}});
				await todayshits.destroy({where:{'server_id':interaction.guild.id,'cb': cbNumber}});
				await times.destroy({where:{'server_id':interaction.guild.id,'cb': cbNumber}});
				for(let j=0;j<userResults.length;j++){
					userResults[j].hits = 0;
					userResults[j].save();
				}
				await i.update({ content: `${total} Data has been removed`, components: [], embeds: [] });
			}
			else{
				await i.update({ content: 'No data has been removed', components: [], embeds: [] });
			}
		});
		collector.on('end', collected => {
			if(collected.size == 0){
				interaction.editReply({content:'No data has been removed', components: [], embeds: []});
			}
		});
	}
};
