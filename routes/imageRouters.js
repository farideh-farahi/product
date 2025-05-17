const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Product } = require("../models"); // ✅ Import Product model

// ✅ Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ✅ Image Upload & Assign to Product via URL (`/cover/:productId`)
router.post("/cover/:productId", upload.single("cover"), async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Received file:", req.file);
    console.log("Received params:", req.params);

    const { productId } = req.params; // ✅ Extract productId from URL

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    // ✅ Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, msg: "Product not found!" });
    }

    // ✅ Generate file URL
    const coverPath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // ✅ Update product with new cover image
    await product.update({ cover: coverPath });

    return res.status(201).json({
      success: true,
      msg: "Image uploaded and assigned to product successfully!",
      productId: productId,
      coverPath: coverPath,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ success: false, msg: "Server error while uploading image", error: error.message });
  }
});

module.exports = router;