const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./commands/${folder}/${file}`);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(token);

for(let i=0;i<guildId.length;i++)
	rest.put(Routes.applicationGuildCommands(clientId, guildId[i]), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
