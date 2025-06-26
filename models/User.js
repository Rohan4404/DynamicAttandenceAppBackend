const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Organization = require("./Organization");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  employee_id: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  role: {
    type: DataTypes.STRING,
    defaultValue: "employee",
  },
});

Organization.hasMany(User, { foreignKey: "org_id" });
User.belongsTo(Organization, { foreignKey: "org_id" });

module.exports = User;
