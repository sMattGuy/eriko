const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('contact')
		.setDescription('Gives you my contact information!'),
	async execute(interaction){
		await interaction.deferReply();
		console.log(interaction.user.username + ' is checking contact');
		
		const contactEmbed = new EmbedBuilder()
		.setColor('#E3443B')
		.setTitle('Contact Information')
		.setDescription(`MattGuy#4376 -> I make bot send feedback here\nhttps://www.matthewflammia.xyz`);
		
		interaction.editReply({embeds:[contactEmbed]});
	}
};