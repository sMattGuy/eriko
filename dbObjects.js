const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const cb = require('./models/Cb.js')(sequelize, Sequelize.DataTypes);
const todayshits = require('./models/TodaysHits.js')(sequelize, Sequelize.DataTypes);
const times = require('./models/Times.js')(sequelize, Sequelize.DataTypes);

Reflect.defineProperty(todayshits, 'getAllHits', {
	value: async (cbnum, serverid) => {
		let hitsFound = await todayshits.findAll({attributes: ['user_id', 'server_id', 'cb', [sequelize.fn('SUM', sequelize.col('hits')), 'n_hits']], where:{'cb': cbnum, 'server_id': serverid},raw:true,group: ['user_id'],});
		if(hitsFound.length == 0){
			return [];
		}
		return hitsFound;
	},
});

Reflect.defineProperty(cb, 'getRecentServerConfig', {
	value: async (serverid) => {
		let configFound = await cb.findOne({attributes: ['server_id', 'start_date', 'end_date', [sequelize.fn('MAX', sequelize.col('cb_id')), 'recentCB']], where:{'server_id': serverid},raw:true});
		return configFound;
	},
});

Reflect.defineProperty(users, 'getCreditedHits', {
	value: async (serverid) => {
		let usersFound = await users.findAll({where:{'server_id': serverid, 'hits':{[Op.gt]: 0}}});
		return usersFound;
	},
});
module.exports = { users, cb, todayshits, times };
