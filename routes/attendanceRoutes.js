const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendanceController");

router.post("/check-in", controller.markCheckIn);
router.post("/check-out", controller.markCheckOut);
router.get("/today/:employee_id", controller.getTodayAttendance);
router.get("/user/:employee_id", controller.getAttendanceHistory);
router.get(
  "/user/getAttendanceByDate/:employee_id/:date",
  controller.getAttendanceByDate
);
router.patch("/setMacApiToZero/:employee_id", controller.setMacApiToZero);

module.exports = router;
