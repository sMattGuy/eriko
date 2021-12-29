module.exports = (sequelize, DataTypes) => {
	return sequelize.define('cb', {
		start: DataTypes.STRING,
		end: DataTypes.STRING,
		num: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},{
		timestamps: false,
	});
};