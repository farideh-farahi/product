const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // ✅ Ensure this folder exists!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // ✅ Generates a unique filename
  },
});

const upload = multer({ storage: storage });

module.exports = upload; 