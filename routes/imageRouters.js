const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Product, FileImage } = require("../models"); 
const validateToken = require("../middlewares/tokenValidation");
const { upload, convertToWebP } = require("../middlewares/uploadMiddleware");


router.post("/cover", validateToken, upload.single("cover"), convertToWebP, async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    const fileSize = req.file.size;
    if (fileSize > 500 * 1024) {
      return res.status(400).json({ success: false, msg: "The maximum size you can upload is 500 KB." });
    }

    const originalPath = `uploads/${Date.now()}-original.webp`;
    const tinyPath = `uploads/${Date.now()}-tiny.webp`;


    fs.renameSync(req.file.path, originalPath);


    await sharp(originalPath)
      .resize({ width: 100 })
      .webp({ quality: 80 })
      .toFile(tinyPath);


    const fileImage = await FileImage.create({
      userId,
      outputPath: path.basename(originalPath)
    });

    return res.status(201).json({
      success: true,
      msg: "Cover image uploaded and resized successfully!",
      fileImageId: fileImage.id,
      userId,
      originalImagePath: path.basename(originalPath),
      tinyImagePath: path.basename(tinyPath),
    });

  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ success: false, msg: "Server error while processing image", error: error.message });
  }
});

router.put("/cover/:id", validateToken, upload.single("cover"), convertToWebP, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    if (!req.file) return res.status(400).json({ success: false, msg: "No file uploaded!" });

    const fileImage = await FileImage.findByPk(id);
    if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });

    // ✅ Delete old cover
    const oldCoverPath = path.join("uploads", fileImage.outputPath);
    if (fs.existsSync(oldCoverPath)) {
      fs.unlinkSync(oldCoverPath);
    }

    // ✅ Save new cover image
    const newCoverPath = `uploads/${Date.now()}-cover.webp`;
    fs.renameSync(req.file.path, newCoverPath);

    // ✅ Update cover image in DB
      await FileImage.update(
      { outputPath: path.basename(newCoverPath) },
      { where: { id } }
    );

    return res.status(200).json({
      success: true,
      msg: "Cover image updated successfully!",
      fileImageId: id,
      userId,
      coverImagePath: path.basename(newCoverPath)
    });

  } catch (error) {
    console.error("Error updating cover image:", error);
    return res.status(500).json({ success: false, msg: "Server error while updating cover image", error: error.message });
  }
});

router.delete("/cover/:id", validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const fileImage = await FileImage.findByPk(id);
    if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });

    const coverPath = path.join("uploads", fileImage.outputPath);
    if (fs.existsSync(coverPath)) {
      fs.unlinkSync(coverPath);
    }

    await fileImage.destroy();

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
