const Attendance = require("../models/Attendance");
const User = require("../models/User");

// 📌 Mark Check-In
exports.markCheckIn = async (req, res) => {
  const { employee_id, location } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().split(" ")[0];

  try {
    if (!location) {
      return res.status(400).json({
        success: false,
        code: "CHECKIN_LOCATION_REQUIRED",
        message: "Location is required for check-in.",
      });
    }

    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const existing = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
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

    res.status(201).json({
      success: true,
      message: "Check-in successful.",
      data: attendance,
    });
  } catch (err) {
    console.error("❌ Check-in error:", err);
    res.status(500).json({
      success: false,
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
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const attendance = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        code: "NOT_CHECKED_IN",
        message: "User hasn't checked in today.",
      });
    }

    if (attendance.check_out) {
      return res.status(400).json({
        success: false,
        code: "ALREADY_CHECKED_OUT",
        message: "Already checked out for today.",
      });
    }

    attendance.check_out = now;
    attendance.check_out_location = location || null;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful.",
      data: attendance,
    });
  } catch (err) {
    console.error("❌ Check-out error:", err);
    res.status(500).json({
      success: false,
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
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const record = await Attendance.findOne({
      where: { employee_id, date: today },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "No attendance record found for today.",
      });
    }

    res.json({
      success: true,
      message: "Attendance record found.",
      data: record,
    });
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({
      success: false,
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
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    const records = await Attendance.findAll({
      where: { employee_id },
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      message: "Attendance history fetched.",
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error("❌ History error:", err);
    res.status(500).json({
      success: false,
      code: "FETCH_HISTORY_ERROR",
      message: "Error fetching attendance history",
    });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  const { employee_id, date } = req.params;

  try {
    // Validate user existence
    const user = await User.findOne({ where: { employee_id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    // Fetch attendance for the given date
    const record = await Attendance.findOne({
      where: {
        employee_id,
        date, // assumes date is in 'YYYY-MM-DD' format
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        code: "NO_RECORD_FOUND",
        message: `No attendance found for ${employee_id} on ${date}`,
      });
    }

    res.json({
      success: true,
      message: `Attendance fetched for ${date}`,
      data: record,
    });
  } catch (err) {
    console.error("❌ Error fetching attendance by date:", err);
    res.status(500).json({
      success: false,
      code: "FETCH_ATTENDANCE_DATE_ERROR",
      message: "Error fetching attendance for given date",
    });
  }
};

exports.setMacApiToZero = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const user = await User.findOne({ where: { employee_id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "INVALID_EMPLOYEE_ID",
        message: "Employee not found.",
      });
    }

    if (user.mac_api !== 1) {
      return res.status(200).json({
        success: false,
        code: "MAC_API_ALREADY_ZERO",
        message: "MAC API is already set to 0. No changes made.",
      });
    }

    await user.update({
      mac_api: 0,
      mac_address: null,
    });

    return res.status(200).json({
      success: true,
      message: "MAC API reset to 0 and MAC address removed.",
    });
  } catch (err) {
    console.error("❌ MAC reset error:", err);
    return res.status(500).json({
      success: false,
      code: "MAC_RESET_ERROR",
      message: "Error resetting MAC API.",
    });
  }
};
