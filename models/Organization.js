const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Organization = sequelize.define(
  "Organization",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    org_code: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[6-9]\d{9}$/i,
      },
    },
    address: DataTypes.STRING,
    contact_person_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_person_number: {
      type: DataTypes.STRING,
      validate: {
        is: /^[6-9]\d{9}$/i,
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: DataTypes.STRING,
    otp_generated_at: DataTypes.DATE,
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    timestamps: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
  }
);

module.exports = Organization;
