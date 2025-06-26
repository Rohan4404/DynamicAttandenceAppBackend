const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Attendance = sequelize.define(
  "Attendance",
  {
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_in: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    check_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    check_in_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    check_out_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Attendance;
