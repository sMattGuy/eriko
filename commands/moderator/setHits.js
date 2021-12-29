const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'sethits',
	description: 'sets a users hits for that day',
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
		let user = interaction.options.getUser('id');
		let selectedUser = user.id;
		let newHits = interaction.options.getInteger('hits');
		console.log(interaction.user.username + ' is removing hits for id ' + selectedUser);
		//check that the database exists
		if(!fs.existsSync(`./config.json`)){
			console.log('No config file found');
			const noConfigEmbed = new MessageEmbed()
				.setColor('#E3443B')
				.setDescription(`No config for this server, ask a mod to set the start and end of a CB!`);
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
							.setDescription(`No database has been made for this server, try hitting the boss!`);
						interaction.editReply({embeds:[noDatabaseEmbed]});
						return;
					}
					else{
						let dataRead = fs.readFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`);
						let dataJSON = JSON.parse(dataRead);
						
						for(let i=0;i<dataJSON.users.length;i++){
							if(dataJSON.users[i].id == selectedUser){
								dataJSON.users[i].hits = newHits;
								let dataSave = JSON.stringify(dataJSON);
								fs.writeFileSync(`./databases/${configJSON.servers[cfg].startCB}${interaction.guild.id}${configJSON.servers[cfg].endCB}.json`,dataSave);
								let userNick = await interaction.guild.members.fetch(dataJSON.users[i].id).then(user => {return user.displayName});
								const removeEmbed = new MessageEmbed()
									.setColor('#E3443B')
									.setDescription(`${userNick} has had their hits set to ${newHits}!`);
								interaction.editReply({embeds:[removeEmbed]});
								return;
							}
						}
						const noUserEmbed = new MessageEmbed()
							.setColor('#E3443B')
							.setDescription(`The user with ID ${selectedUser} does not exist in the database!`);
						interaction.editReply({embeds:[noUserEmbed]});
						return;
					}
				}
			}
		}
	}
};