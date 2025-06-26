const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Superadmin = sequelize.define("Superadmin", {
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});

module.exports = Superadmin;
