const { verifyToken } = require("../utils/tokenHelper");

async function validateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, msg: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, msg: "Invalid or expired token" });
  }

  req.user = decoded; // Attach user data from JWT
  console.log("Decoded user:", req.user);
  next();
}

module.exports = validateToken;