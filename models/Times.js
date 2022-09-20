module.exports = (sequelize, DataTypes) => {
	return sequelize.define('times', {
		user_id: {
			type: DataTypes.STRING,
		},
		server_id: {
			type: DataTypes.STRING,
		},
		hits: {
			type: DataTypes.INTEGER,
		},
		cb: {
			type: DataTypes.INTEGER,
		},
		times: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};