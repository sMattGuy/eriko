module.exports = (sequelize, DataTypes) => {
	return sequelize.define('guilds', {
		user_id: DataTypes.STRING,
		guild_id: DataTypes.STRING, 
	},{
		timestamps: false,
	});
};