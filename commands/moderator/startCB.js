const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'startcb',
	description: 'sets the start of a CB',
	async execute(interaction){
		if(interaction.member.roles.cache.has('815669639107051552') || interaction.member.roles.cache.has('815669643648827452') || interaction.member.roles.cache.has('872981028262801448') || interaction.guild.ownerId === interaction.user.id){
			//pull the final date part into a separate variable
			let selectedDate = interaction.options.getString('date');
			if(selectedDate.length != 8){
				const invalidFormatEmbed = new MessageEmbed()
					.setColor('#E3443B')
					.setDescription(`Make sure your date is in MMDDYYYY format!`);
				interaction.reply({embeds:[invalidFormatEmbed]});
				return;
			}
			console.log(interaction.user.username + ' is setting the CB start for ' + selectedDate);
			//check that the database exists
			if(!fs.existsSync(`./config.json`)){
				console.log('No config file found, making new one');
				let newConfig = {servers:[]};
				let configSave = JSON.stringify(newConfig);
				fs.writeFileSync(`./config.json`,configSave);
			}
			//read the database
			let configRead = fs.readFileSync(`./config.json`);
			let configJSON = JSON.parse(configRead);
			let guildID = interaction.guild.id;
			//writes the start of CB
			let foundConfig = false;
			for(let i=0;i<configJSON.servers.length;i++){
				if(configJSON.servers[i].id == guildID){
					foundConfig = true;
					configJSON.servers[i].startCB = selectedDate;
					break;
				}
			}
			if(!foundConfig){
				//new config entry
				let newConfigEntry = {'id':guildID,startCB:selectedDate,endCB:'00000000'};
				configJSON.servers.push(newConfigEntry);
			}
			
			//writes to database
			let configSave = JSON.stringify(configJSON);
			fs.writeFileSync(`./config.json`,configSave);
			const setStartEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`The CB start date has been set to ${selectedDate}`);
			interaction.reply({embeds:[setStartEmbed]});
		}
		else{
			const noPermissionEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`You do not have permission to use this command!`);
			interaction.reply({embeds:[noPermissionEmbed]});
		}
	}
};