const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/Cb.js')(sequelize, Sequelize.DataTypes);
require('./models/TodaysHits.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
const alter = process.argv.includes('--alter') || process.argv.includes('-a');

sequelize.sync({ force, alter }).then(async () => {
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);