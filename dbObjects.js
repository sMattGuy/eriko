const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite'
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);
const Hits = require('./models/Hits.js')(sequelize, Sequelize.DataTypes);
const Cb = require('./models/Cb.js')(sequelize, Sequelize.DataTypes);

//guild information
Reflect.defineProperty(Users.prototype, 'addGuild', {
	value: async function addGuild(guild){
		const userGuild = await Guilds.findOne({
			where:{user_id: this.user_id, guild_id:guild}
		});
		if(userGuild){
			//already exists, ignore
			return;
		}
		//add user to guild
		return Guilds.create({user_id: this.user_id, guild_id:guild});
	}
});

Reflect.defineProperty(Users.prototype, 'checkGuild', {
	value: function checkGuild(guild){
		return Guilds.findOne({
			where:{user_id: this.user_id, guild_id:guild}
		});
	}
});

Reflect.defineProperty(Users.prototype, 'countGuilds', {
	value: async function countGuilds(){
		return await Guilds.count({
			where:{user_id: this.user_id}
		});
	}
});
//hits
Reflect.defineProperty(Users.prototype, 'setHits', {
	value: async function setHits(date, hits, guild){
		const userHits = await Hits.findOne({
			where:{
				user_id: this.user_id,
				guild_id: guild,
				date: date,
			}
		});
		if(userHits){
			//user found
			userHits.hits = hits;
			return userHits.save();
		}
		else{
			//user wasnt found, add them
			return Hits.create({
				user_id: this.user_id,
				guild_id: guild,
				date: date,
				hits: hits,
			});
		}
	}
});
Reflect.defineProperty(Users.prototype, 'getHits', {
	value: async function getHits(date, guild){
		const userHits = await Hits.findOne({
			where:{
				user_id: this.user_id,
				guild_id: guild,
				date: date,
			}
		});
		return userHits ? userHits.hits : 0;
	}
});



module.exports = { Users, Guilds };