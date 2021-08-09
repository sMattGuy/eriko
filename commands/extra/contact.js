const { MessageEmbed } = require('discord.js');

const MAXHITS = 3

module.exports = {
	name: 'contact',
	description: 'gets my contact',
	async execute(interaction){
		console.log(interaction.user.username + ' is checking contact');
		
		const contactEmbed = new MessageEmbed()
		.setColor('#E3443B')
		.setTitle('Contact Information')
		.setDescription(`MattGuy#4376 -> I make bot send feedback here`);
		interaction.reply({embeds:[contactEmbed]});
	}
};