const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'endcb',
	description: 'sets the end date of a CB',
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
		let selectedDate = interaction.options.getString('date');
		if(selectedDate.length != 8){
			const invalidFormatEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`Make sure your date is in MMDDYYYY format!`);
			interaction.editReply({embeds:[invalidFormatEmbed]});
			return;
		}
		console.log(interaction.user.username + ' is setting the CB end for ' + selectedDate);
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
		
		let foundConfig = false;
		for(let i=0;i<configJSON.servers.length;i++){
			if(configJSON.servers[i].id == guildID){
				foundConfig = true;
				let startCB = new Date(`${configJSON.servers[i].startCB.substring(0,2)}/${configJSON.servers[i].startCB.substring(2,4)}/${configJSON.servers[i].startCB.substring(4,8)}`);
				startCB.setUTCHours(13);
				startCB.setUTCMinutes(0);
				startCB.setUTCSeconds(0);
				startCB.setUTCMilliseconds(0);
				console.log(startCB);
				
				let endCB = new Date(`${selectedDate.substring(0,2)}/${selectedDate.substring(2,4)}/${selectedDate.substring(4,8)}`);
				endCB.setUTCHours(13);
				endCB.setUTCMinutes(0);
				endCB.setUTCSeconds(0);
				endCB.setUTCMilliseconds(0);
				console.log(endCB);
				
				if(endCB.getTime() - startCB.getTime() < 0){
					const invalidEndTime = new MessageEmbed()
						.setColor('#E3443B')
						.setDescription(`End time cannot be before the start time!`);
					interaction.editReply({embeds:[invalidEndTime]});
					return;
				}
				
				//writes the end of CB
				configJSON.servers[i].endCB = selectedDate;
				break;
			}
		}
		if(!foundConfig){
			//new config entry
			let newConfigEntry = {'id':guildID,startCB:'00000000',endCB:selectedDate};
			configJSON.servers.push(newConfigEntry);
		}
		
		
		//writes to database
		let configSave = JSON.stringify(configJSON);
		fs.writeFileSync(`./config.json`,configSave);
		const setEndEmbed = new MessageEmbed()
			.setColor('#E3443B')
			.setDescription(`The CB end date has been set to ${selectedDate}`);
		interaction.editReply({embeds:[setEndEmbed]});
	}
};