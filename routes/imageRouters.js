const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { Product } = require("../models"); // ✅ Import Product model
const storage = multer.memoryStorage();
const validateToken = require ("../middlewares/tokenValidation")



const upload = multer({ storage: storage });

router.post("/cover/:productId", validateToken,upload.single("cover"), async (req, res) => {
  
  try {

    const { productId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, msg: "Product not found!" });
    }

    const coverPath = `${req.file.filename}`;
    const fileSize = req.file.size;
    if ( fileSize> 500 * 1024 ){
      return res.status(400).json({ success: false, msg: "The maximum size you can upload is 500 KB." });
    }

    await product.update({ cover: coverPath });

    return res.status(201).json({
      success: true,
      msg: "Image uploaded and assigned to product successfully!",
      productId: productId,
      userId: userId,
      coverPath: coverPath,
      fileSize: `${(fileSize / 1024).toFixed(2)} KB`
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ success: false, msg: "Server error while uploading image", error: error.message });
  }
});

router.post("/resize",validateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    const outputPath = `uploads/${Date.now()}-resized.webp`;

    // ✅ Resize image before saving
    await sharp(req.file.buffer)
      .resize({ width: 800 }) // Set width while keeping aspect ratio
      .webp({ quality: 80 }) // Compress image
      .toFile(outputPath);

    return res.status(201).json({
      success: true,
      msg: "Image resized successfully!",
      resizedImagePath: path.basename(outputPath),
    });

  } catch (error) {
    console.error("Error resizing image:", error);
    return res.status(500).json({ success: false, msg: "Error resizing image", error: error.message });
  }
});


module.exports = router;