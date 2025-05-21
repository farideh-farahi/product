const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const convertToWebP = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const inputPath = file.path;
        const outputPath = `uploads/${Date.now()}.webp`;

        await sharp(inputPath).toFormat("webp").toFile(outputPath);

        // Replace the file path with WebP format
        file.path = outputPath;
        file.filename = path.basename(outputPath);

        // Remove the original file
        fs.unlinkSync(inputPath);
      })
    );
  } catch (error) {
    console.error("Error converting images to WebP:", error);
    return res.status(500).json({ error: "Failed to process images" });
  }

  next();
};


module.exports = { upload, convertToWebP };
