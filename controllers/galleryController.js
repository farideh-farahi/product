const fs = require("fs");
const { Gallery, FileImage } = require("../models");

//gallery 
const createGallery = async (req, res) => {
  try {

    const userId = req.user?.user_id;

    if (!req.file || req.file.length === 0) {
      return res.status(400).json({ message: "No file uploaded!" });
    }
    const webpImages = req.file.map(file => file.filename)
    const fileImage = await FileImage.create({
      userId,
      outputPath: { images: webpImages }
    });

    const galleryEntries = await Promise.all(
          webpImages.map(async imagePath => {
            const gallery = await Gallery.create({ imageUrl: imagePath });
            return { id: gallery.id, imageUrl: imagePath };
          })
        );

    return res.status(201).json({ 
      fileImageId: fileImage.id,
      images: galleryEntries,
      message: "Gallery created and images uploaded successfully!"
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllGalleries = async (req, res) => {
  try {
    // 🔍 Fetch all galleries from FileImage table
    const galleries = await FileImage.findAll({
      attributes: ["id", "outputPath"]
    });

    if (!galleries.length) {
      return res.status(404).json({ message: "No galleries found." });
    }
    console.log("FileImage Retrieved:", FileImage);

    // ✅ Format response with gallery ID and associated images
    const formattedGalleries = galleries.map(gallery => ({
      galleryId: gallery.id,
      images: gallery.outputPath.images.map(image => ({
        id: image, // Image ID (if stored as filename)
        imageUrl: image
      }))
    }));

    return res.status(200).json({
      galleries: formattedGalleries,
      message: "Galleries retrieved successfully!"
    });
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const getGalleryById = async (req, res) => {
  try {
    const { galleryId } = req.params;

    const fileImage = await FileImage.findByPk(galleryId);
    if (!fileImage) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    return res.status(200).json({
      galleryId: fileImage.id,
      images: fileImage.outputPath.images,
      message: "Gallery retrieved successfully!"
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteGalleryById = async (req, res) => {
  try {
    const { galleryId } = req.params;

    const fileImage = await FileImage.findByPk(galleryId);
    if (!fileImage) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    const webpImagePaths = fileImage.outputPath.images;

    await Gallery.destroy({ where: { imageUrl: webpImagePaths } });
    await fileImage.destroy();


    webpImagePaths.forEach(imagePath => {
      const fullPath = `uploads/${imagePath}`;
      fs.unlink(fullPath, (err) => {
        if (err) console.error("Error deleting file from disk:", err);
      });
    });

    return res.status(200).json({ message: "Gallery and associated images deleted successfully!" });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
//single image

const getSingleImageById = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await Gallery.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    return res.status(200).json({
      id: image.id,
      imageUrl: image.imageUrl,
      message: "Image retrieved successfully!"
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const replaceImageById = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!req.file || req.file.length === 0) {
      return res.status(400).json({ message: "New image file is required." });
    }

    const newWebpImage = req.file.filename;

    const image = await Gallery.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const oldImagePath = `uploads/${image.imageUrl}`;

    await image.update({ imageUrl: newWebpImage });

    fs.unlink(oldImagePath, (err) => {
      if (err) console.error("Error deleting old file:", err);
    });

    return res.status(200).json({ 
      id: image.id,
      newImageUrl: newWebpImage,
      message: "Image replaced successfully!"
    });
  } catch (error) {
    console.error("Error replacing image:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteImageById = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Gallery.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const imagePath = `uploads/${image.imageUrl}`;

    await image.destroy();

    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting file from disk:", err);
    });

    return res.status(200).json({ message: "Image deleted successfully!" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = { 
  createGallery, 
  getGalleryById,
  getAllGalleries,
  deleteGalleryById, 
  getSingleImageById, 
  replaceImageById, 
  deleteImageById
};
