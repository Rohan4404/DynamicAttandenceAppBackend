const User = require("../models/User");
const Organization = require("../models/Organization");

function formatEmployeeId(code, number) {
  return `${code}-${String(number).padStart(4, "0")}`; // e.g., SYS-0001
}

// 📌 Create New User
exports.createUser = async (req, res) => {
  try {
    const orgId = req.user.id;
    const { name, email, phone, role } = req.body;

    const org = await Organization.findByPk(orgId);
    if (!org)
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });

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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Create user error:", err);
    res.status(500).json({
      success: false,
      message: "User creation failed",
    });
  }
};

// 📌 Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const orgId = req.user.id;

    const users = await User.findAll({
      where: { org_id: orgId },
      attributes: {
        exclude: ["password", "org_id"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// 📌 Get User by Employee ID
exports.getUserById = async (req, res) => {
  try {
    const orgId = req.user.id;
    const { id } = req.params; // `id` = employee_id

    const user = await User.findOne({
      where: {
        employee_id: id,
        org_id: orgId,
      },
    });

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("❌ Get user error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// 📌 Update User by Employee ID
exports.updateUser = async (req, res) => {
  try {
    const orgId = req.user.id;
    const { employee_id, name, email, phone, role } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id is required",
      });
    }

    const user = await User.findOne({
      where: { employee_id, org_id: orgId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Update user error:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

// 📌 Delete User by ID
exports.deleteUser = async (req, res) => {
  try {
    const orgId = req.user.id;
    const deleted = await User.destroy({
      where: { id: req.params.id, org_id: orgId },
    });

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({
      success: false,
      message: "Deletion failed",
    });
  }
};

// 📌 Get User Profile by JWT User ID
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};
