const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendanceController");

router.post("/check-in", controller.markCheckIn);
router.post("/check-out", controller.markCheckOut);
router.get("/today/:employee_id", controller.getTodayAttendance);
router.get("/user/:employee_id", controller.getAttendanceHistory);

module.exports = router;
