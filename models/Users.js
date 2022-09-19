module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		server_id: {
			type: DataTypes.STRING,
		},
		hits: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	}, {
		timestamps: false,
	});
};