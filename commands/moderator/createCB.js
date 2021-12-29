const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'createcb',
	description: 'creates a new CB',
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
		let startDate = interaction.options.getString('start');
		let endDate = interaction.options.getString('end');
		let cbNumber = interaction.options.getInteger('number');
		if(startDate.length != 8 || endDate.length != 8){
			const invalidFormatEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`Make sure your date is in MMDDYYYY format!`);
			interaction.editReply({embeds:[invalidFormatEmbed]});
			return;
		}
		if(cbNumber <= 0){
			const invalidNumberEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`Make sure your CB Number is correct!`);
			interaction.editReply({embeds:[invalidNumberEmbed]});
			return;
		}
		console.log(interaction.user.username + ' is creating the CB ' + startDate + ' ' + endDate + ' ' + cbNumber);
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
				configJSON.servers[i].startCB = startDate;
				configJSON.servers[i].endCB = endDate;
				break;
			}
		}
		if(!foundConfig){
			//new config entry
			let newConfigEntry = {'id':guildID,startCB:startDate,endCB:endDate};
			configJSON.servers.push(newConfigEntry);
		}
		//writes new database
		if(!fs.existsSync(`./databases/${startDate}${interaction.guild.id}${endDate}.json`)){
			let newDatabaseFile = {num:cbNumber, users:[]};
			//JSON compression and file write
			let dataSave = JSON.stringify(newDatabaseFile);
			fs.writeFileSync(`./databases/${startDate}${interaction.guild.id}${endDate}.json`,dataSave);
		}
		//writes to config
		let configSave = JSON.stringify(configJSON);
		fs.writeFileSync(`./config.json`,configSave);
		const setStartEmbed = new MessageEmbed()
			.setColor('#E3443B')
			.setDescription(`CB number ${cbNumber} has been created with start date ${startDate} and end date ${endDate}`);
		interaction.editReply({embeds:[setStartEmbed]});
	}
};