module.exports = (sequelize, DataTypes) => {
	return sequelize.define('cb', {
		server_id: {
			type: DataTypes.STRING,
		},
		cb_id: {
			type: DataTypes.INTEGER,
		},
		start_date: {
			type: DataTypes.STRING,
		},
		end_date: {
			type: DataTypes.STRING,
		}
	}, {
		timestamps: false,
	});
};