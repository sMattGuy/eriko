const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'setnumber',
	description: 'sets the current CB number',
	async execute(interaction){
		await interaction.deferReply();
		if(!interaction.member.roles.cache.has('815669639107051552') && !interaction.member.roles.cache.has('815669643648827452') && !interaction.member.roles.cache.has('872981028262801448') && !interaction.guild.ownerId === interaction.user.id){
			const invalidPermissions = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`You do not have permission to use this command!`);
			interaction.editReply({embeds:[invalidPermissions]});
			return;
		}
		//pull the final date part into a separate variable
		let cbNumber = interaction.options.getInteger('number');
		console.log(interaction.user.username + ' is setting cb number to ' + cbNumber);
		//check that the database exists
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`No config for this server, create a CB first!`);
			interaction.editReply({embeds:[noConfigEmbed]});
		}
		else{
			//read the database
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			for(let cfg=0;cfg<configJSON.servers.length;cfg++){
				if(configJSON.servers[cfg].id == interaction.guild.id){
					if(!fs.existsSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`)){
						console.log('No database file found');
						const noDatabaseEmbed = new MessageEmbed()
							.setColor('#E3443B')
							.setDescription(`No database has been made for this server, try creating a CB!`);
						interaction.editReply({embeds:[noDatabaseEmbed]});
						return;
					}
					else{
						let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
						let dataJSON = JSON.parse(dataRead);
						
						dataJSON.num = cbNumber;
						
						let dataSave = JSON.stringify(dataJSON);
						fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
						const numEmbed = new MessageEmbed()
							.setColor('#E3443B')
							.setDescription(`The CB number has been set to ${cbNumber}!`);
						interaction.editReply({embeds:[numEmbed]});
						return;
					}
				}
			}
		}
	}
};