const sequelize = require("../config/db");
const Organization = require("../models/Organization");
const User = require("../models/User");

const seedDemoUsers = async () => {
  await sequelize.authenticate();

  const org = await Organization.findOne({
    where: { email: "test@systaldyn.in" },
  });
  if (!org)
    return console.log(
      "❌ Org not found. Make sure it's registered & verified."
    );

  const orgId = org.id;
  const orgCode = org.org_code;

  const existingCount = await User.count({ where: { org_id: orgId } });

  const users = ["Alice", "Bob", "Charlie", "Diana"];
  for (let i = 0; i < users.length; i++) {
    const employee_id = `${orgCode}-${String(existingCount + i + 1).padStart(
      4,
      "0"
    )}`;
    await User.create({
      name: users[i],
      email: `${users[i].toLowerCase()}@${org.name.toLowerCase()}.com`,
      phone: `99900000${i + 1}`,
      role: "employee",
      employee_id,
      org_id: orgId,
    });
    console.log(`✅ Created user ${users[i]} (${employee_id})`);
  }
};

seedDemoUsers().catch(console.error);
