module.exports = (sequelize, DataTypes) => {
	return sequelize.define('hits', {
		user_id: DataTypes.STRING,
		guild_id: DataTypes.STRING,
		date: DataTypes.STRING,
		hits: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},{
		timestamps: false,
	});
};