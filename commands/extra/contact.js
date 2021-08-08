const fs = require('fs');

const MAXHITS = 3

module.exports = {
	name: 'contact',
	description: 'gets my contact',
	execute(interaction){
		console.log(interaction.user.username + ' is checking contact');
		interaction.reply(`MattGuy#4376 -> I make bot send feedback here`);
	}
};