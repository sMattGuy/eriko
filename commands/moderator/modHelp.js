const fs = require('fs');

module.exports = {
	name: 'modhelp',
	description: 'gets help for moderators',
	execute(client,message){
		if(message.member.roles.cache.has('815669639107051552') || message.member.roles.cache.has('815669643648827452') || message.member.roles.cache.has('872981028262801448') || message.guild.ownerID === message.author.id){
			console.log(message.author.username + ' is checking help');
			message.channel.send(`\nUse !eriko startCB <MMDDYYYY> -> to set the start date for the CB\nUse !eriko endCB <MMDDYYYY> -> to set the end of a clan battle\nUse !eriko removeHits <userID> -> to remove a users hits for today`);
		}
		else{
			message.channel.send(`You do not have permission to use that command!`);
		}
	}
};