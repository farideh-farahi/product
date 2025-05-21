const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Product, FileImage } = require("../models"); 
const validateToken = require("../middlewares/tokenValidation");
const { upload, convertToWebP } = require("../middlewares/uploadMiddleware");


router.post("/cover/:productId", validateToken, upload.single("cover"), convertToWebP, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, msg: "Product not found!" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    const fileSize = req.file.size;
    if (fileSize > 500 * 1024) {
      return res.status(400).json({ success: false, msg: "The maximum size you can upload is 500 KB." });
    }

    if (product.cover) {
      return res.status(400).json({ success: false, msg: "This product already has a cover! Use the update route instead." });
    }

    const originalPath = `uploads/${Date.now()}-${productId}-original.webp`;
    const tinyPath = `uploads/${Date.now()}-${productId}-tiny.webp`;

    // ✅ Save original image
    fs.renameSync(req.file.path, originalPath);

    // ✅ Generate tiny version (e.g., width: 100px)
    await sharp(originalPath)
      .resize({ width: 100 })
      .webp({ quality: 80 })
      .toFile(tinyPath);

    // ✅ Update product cover to the resized version
    await product.update({ cover: path.basename(tinyPath) });

    return res.status(201).json({
      success: true,
      msg: "Cover image uploaded and resized successfully!",
      productId,
      userId,
      originalImagePath: path.basename(originalPath),
      tinyImagePath: path.basename(tinyPath),
      fileSize: `${(fileSize / 1024).toFixed(2)} KB`
    });

  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ success: false, msg: "Server error while processing image", error: error.message });
  }
});

router.put("/cover/:productId", validateToken, upload.single("cover"), convertToWebP, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

    if (!req.file) return res.status(400).json({ success: false, msg: "No file uploaded!" });

    // ✅ Check if a cover exists
    if (!product.cover) {
      return res.status(400).json({ success: false, msg: "This product does not have a cover yet! Use the create route instead." });
    }

    // ✅ Delete old cover
    const oldCoverPath = path.join("uploads", product.cover);
    if (fs.existsSync(oldCoverPath)) {
      fs.unlinkSync(oldCoverPath);
    }

    // ✅ Save new cover image
    const newCoverPath = `uploads/${Date.now()}-${productId}-cover.webp`;
    fs.renameSync(req.file.path, newCoverPath);

    // ✅ Update cover image in DB
    await product.update({ cover: path.basename(newCoverPath) });

    return res.status(200).json({
      success: true,
      msg: "Cover image updated successfully!",
      productId,
      userId,
      coverImagePath: path.basename(newCoverPath)
    });

  } catch (error) {
    console.error("Error updating cover image:", error);
    return res.status(500).json({ success: false, msg: "Server error while updating cover image", error: error.message });
  }
});

router.delete("/cover/:productId", validateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

    if (!product.cover) return res.status(400).json({ success: false, msg: "No cover image to delete!" });

    const coverPath = path.join("uploads", product.cover);
    if (fs.existsSync(coverPath)) {
      fs.unlinkSync(coverPath);
    }

    await product.update({ cover: null });

    return res.status(200).json({ success: true, msg: "Cover image deleted successfully!" });

  } catch (error) {
    console.error("Error deleting cover image:", error);
    return res.status(500).json({ success: false, msg: "Server error while deleting cover image", error: error.message });
  }
});

router.get("/user/:userId", validateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Query the database for images linked to this user
    const userImages = await FileImage.findAll({ where: { userId } });

    if (!userImages.length) {
      return res.status(404).json({ success: false, msg: "No images found for this user!" });
    }

    return res.status(200).json({
      success: true,
      msg: "User images retrieved successfully!",
      images: userImages
    });

  } catch (error) {
    console.error("Error retrieving user images:", error);
    return res.status(500).json({ success: false, msg: "Server error while fetching images", error: error.message });
  }
});

module.exports = router;
