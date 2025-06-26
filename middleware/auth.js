const jwt = require("jsonwebtoken");
const Organization = require("../models/Organization");

exports.verifyToken = (requiredRole) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (requiredRole === "org-admin") {
        const org = await Organization.findByPk(decoded.id);
        if (!org || !org.is_verified)
          return res.status(403).json({ message: "Access denied" });
        req.user = { id: org.id, role: "org-admin" };
      }

      if (requiredRole === "superadmin") {
        req.user = { id: decoded.id, role: "superadmin" };
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  };
};
