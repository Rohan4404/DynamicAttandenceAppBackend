const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { Op } = require("sequelize");

// 📌 Mark Check-In
exports.markCheckIn = async (req, res) => {
  const { employee_id, location } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().split(" ")[0];

  try {
    if (!location) {
      return res.status(400).json({
        code: "CHECKIN_LOCATION_REQUIRED",
        message: "Location is required for check-in.",
      });
    }

    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const existing = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (existing) {
      return res.status(400).json({
        code: "ALREADY_CHECKED_IN",
        message: "Already checked in for today.",
      });
    }

    const attendance = await Attendance.create({
      employee_id,
      date: today,
      check_in: now,
      check_in_location: location,
    });

    res.status(201).json({ message: "Checked in", attendance });
  } catch (err) {
    console.error("❌ Check-in error:", err);
    res.status(500).json({
      code: "CHECKIN_ERROR",
      message: "Failed to check in",
    });
  }
};

// 📌 Mark Check-Out
exports.markCheckOut = async (req, res) => {
  const { employee_id, location } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().split(" ")[0];

  try {
    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const attendance = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (!attendance) {
      return res.status(400).json({
        code: "NOT_CHECKED_IN",
        message: "User hasn't checked in today.",
      });
    }

    if (attendance.check_out) {
      return res.status(400).json({
        code: "ALREADY_CHECKED_OUT",
        message: "Already checked out for today.",
      });
    }

    attendance.check_out = now;
    attendance.check_out_location = location || null;
    await attendance.save();

    res.status(200).json({ message: "Checked out", attendance });
  } catch (err) {
    console.error("❌ Check-out error:", err);
    res.status(500).json({
      code: "CHECKOUT_ERROR",
      message: "Failed to check out",
    });
  }
};

// 📌 Get Today's Attendance
exports.getTodayAttendance = async (req, res) => {
  const { employee_id } = req.params;
  const today = new Date().toISOString().split("T")[0];

  try {
    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const record = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (!record) {
      return res.status(404).json({
        code: "NOT_FOUND",
        message: "No attendance for today",
      });
    }

    res.json(record);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({
      code: "FETCH_ERROR",
      message: "Error fetching today's attendance",
    });
  }
};

// 📌 Get Full History
exports.getAttendanceHistory = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const records = await Attendance.findAll({
      where: { employee_id },
      order: [["date", "DESC"]],
    });

    res.json(records);
  } catch (err) {
    console.error("❌ History error:", err);
    res.status(500).json({
      code: "FETCH_HISTORY_ERROR",
      message: "Error fetching attendance history",
    });
  }
};
