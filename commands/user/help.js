const fs = require('fs');

const MAXHITS = 3

module.exports = {
	name: 'help',
	description: 'gets the help menu',
	execute(client,message){
		console.log(message.author.username + ' is checking help');
		message.channel.send(`Use !eriko hit <blank or 1-${MAXHITS}> -> to count that you hit the boss for today!\nUse !eriko checkTodaysHits -> to see everyone's hits for today!\nUse !eriko today -> to see what today's date is!\nUse !eriko checkHits <MMDDYYYY / CBDay> -> to see the hits for a specific day! (Note though that the time is in UTC and the format is 07052021 for July 5th 2021)\n!eriko contact -> give remarks here\nUse !eriko nextCB -> to see the date of the next CB`);
	}
};