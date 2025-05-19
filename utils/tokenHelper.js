const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

function generateToken(user) {
  console.log("Generating Token for:", user); // ✅ Debugging step
  if (!user.id) {
    throw new Error("Missing user ID");
  }
  return jwt.sign({ user_id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "10h" });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded Token Data:", decoded); // ✅ Debugging step
    return decoded;
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };