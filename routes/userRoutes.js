const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken("org-admin")); // all routes require org-admin auth

router.post("/create", createUser);
router.get("/get-all", getAllUsers);
router.get("/:id", getUserById);
router.put("/update", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
