const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { times } = require('../../dbObjects.js');
const fs = require('fs');
const { Buffer } = require('buffer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exporttimes')
		.setDescription('Admin only! Export times of hits'),
	async execute(interaction){
		await interaction.deferReply();
		if(!interaction.member.roles.cache.has('815669639107051552') && !interaction.member.roles.cache.has('815669643648827452') && !interaction.member.roles.cache.has('872981028262801448') && !interaction.guild.ownerId === interaction.user.id){
			const invalidPermissions = new EmbedBuilder()
				.setColor('#E3443B')
				.setDescription(`You do not have permission to use this command!`);
			interaction.editReply({embeds:[invalidPermissions]});
			return;
		}
		console.log(interaction.user.username + ' is exporting times');
		
		let gottenTimes = await times.findAll({where:{'server_id': interaction.guild.id}});
		if(gottenTimes.length  == 0){
			const contactEmbed = new EmbedBuilder()
				.setColor('#E3443B')
				.setTitle('Error')
				.setDescription(`No data to export.`);
		
			await interaction.editReply({embeds:[contactEmbed]});
			return;
		}
		let dataCSV = 'user_id,server_id,hits,times\n';
		
		for(let i=0;i<gottenTimes.length;i++){
			dataCSV += `${gottenTimes[i].user_id},${gottenTimes[i].server_id},${gottenTimes[i].hits},${gottenTimes[i].times}\n`;
		}
		
		fs.writeFileSync('./times.csv',dataCSV);
		let resultFile = fs.readFileSync('./times.csv');
		
		const contactEmbed = new EmbedBuilder()
		.setColor('#E3443B')
		.setTitle('Data Attached')
		.setDescription(`Data Exported.`);
		
		await interaction.editReply({embeds:[contactEmbed], files:[{'attachment': resultFile, 'name': 'times.csv'}]});
		
		fs.unlinkSync('./times.csv');
	}
};