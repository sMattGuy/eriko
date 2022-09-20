module.exports = (sequelize, DataTypes) => {
	return sequelize.define('todayshits', {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		server_id: {
			type: DataTypes.STRING,
		},
		date: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		hits: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		cb: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};