const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'contact',
	description: 'gets my contact',
	async execute(interaction){
		await interaction.deferReply();
		console.log(interaction.user.username + ' is checking contact');
		
		const contactEmbed = new MessageEmbed()
		.setColor('#E3443B')
		.setTitle('Contact Information')
		.setDescription(`MattGuy#4376 -> I make bot send feedback here\nhttps://www.matthewflammia.xyz`);
		
		interaction.editReply({embeds:[contactEmbed]});
	}
};