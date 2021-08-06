const fs = require('fs');

const MAXHITS = 3

module.exports = {
	name: 'contact',
	description: 'gets my contact',
	execute(client,message){
		console.log(message.author.username + ' is checking contact');
		message.channel.send(`MattGuy#4376 -> I make bot send feedback here`);
	}
};