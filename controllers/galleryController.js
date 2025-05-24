const path = require("path");
const fs = require("fs");
const { Gallery, FileImage } = require("../models");
const { convertToWebP } = require("../middlewares/uploadMiddleware");

const createImage = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded!" });
    }

    // ✅ First, save images in FileImage
    const fileImages = await Promise.all(
      req.files.map(async (file) => {
        const savedFileImage = await FileImage.create({
          userId,
          outputPath: file.filename
        });
        return savedFileImage;
      })
    );
    const fileImageIdsString = fileImages.map(image => image.id).join(",");

    return res.status(201).json({
        success: true,
        message: "Images uploaded successfully!",
        galleryIds: fileImageIdsString,
    });


  } catch (error) {
    console.error("Error creating image:", error);
    res.status(500).json({ error: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const image = await FileImage.findByPk(req.params.id); // ✅ Fetch from FileImage instead of Gallery
    if (!image) return res.status(404).json({ message: "Image not found!" });

    res.status(200).json({
      success: true,
      fileImageId: image.id, // ✅ Return FileImage ID
      outputPath: image.outputPath,
    });

  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({ error: error.message });
  }
};

const replaceImage = async (req, res) => {
  try {
    const fileImage = await FileImage.findByPk(req.params.id);
    if (!fileImage) return res.status(404).json({ message: "Image not found!" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded!" });

    const oldImagePath = path.join("uploads", fileImage.outputPath);
    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);

    await convertToWebP(req, res, async () => {
      const newImagePath = req.file.filename;

      await fileImage.update({ outputPath: newImagePath });

      res.status(200).json({
        success: true,
        message: "Image replaced successfully!",
        fileImageId: fileImage.id,
        newOutputPath: newImagePath,
      });
    });

  } catch (error) {
    console.error("Error replacing image:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const fileImage = await FileImage.findByPk(req.params.id); // ✅ Fetch from FileImage
    if (!fileImage) return res.status(404).json({ message: "Image not found!" });

    const imagePath = path.join("uploads", fileImage.outputPath);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await fileImage.destroy();
    res.status(200).json({ success: true, message: "Image deleted successfully!" });

  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createImage, getImageById, replaceImage, deleteImage };
