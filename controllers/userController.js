const User = require("../models/User");
const Organization = require("../models/Organization");

function formatEmployeeId(code, number) {
  return `${code}-${String(number).padStart(4, "0")}`; // e.g., SYS-0001
}

exports.createUser = async (req, res) => {
  try {
    const orgId = req.user.id; // Extracted from JWT via middleware
    const { name, email, phone, role } = req.body;

    const org = await Organization.findByPk(orgId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const userCount = await User.count({ where: { org_id: orgId } });
    const employee_id = formatEmployeeId(org.org_code, userCount + 1);

    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      employee_id,
      org_id: orgId,
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "User creation failed" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const orgId = req.user.id;

    const users = await User.findAll({
      where: { org_id: orgId },
      attributes: {
        exclude: ["password", "org_id"], // remove sensitive/internal fields
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ count: users.length, users });
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ message: "Failed to get users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const orgId = req.user.id;
    const { id } = req.params; // Here `id` will actually be the employee_id

    const user = await User.findOne({
      where: {
        employee_id: id,
        org_id: orgId,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Get user error:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const orgId = req.user.id;
    const { employee_id, name, email, phone, role } = req.body;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    const user = await User.findOne({
      where: { employee_id, org_id: orgId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;

    await user.save();

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Update user error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const orgId = req.user.id;
    const deleted = await User.destroy({
      where: { id: req.params.id, org_id: orgId },
    });
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT via middleware
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user profile" });
  }
};
