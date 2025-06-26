const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");
const Superadmin = require("../models/Superadmin");

const seedSuperadmin = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const existing = await Superadmin.findOne({
    where: { email: "superadmin@hr.com" },
  });
  if (existing) {
    console.log("✅ Superadmin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("supersecure", 10);
  await Superadmin.create({
    email: "superadmin@hr.com",
    password: hashedPassword,
  });

  console.log("✅ Superadmin seeded");
};

seedSuperadmin().catch((err) => {
  console.error("❌ Error seeding superadmin:", err);
});
