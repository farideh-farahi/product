const fs = require("fs");
const { Sequelize } = require("sequelize"); 


const { Gallery, FileImage } = require("../models");

//gallery 
const createGallery = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const webpImages = req.files.map(file => file.filename);
    const fileImage = await FileImage.create({
      userId,
      outputPath: JSON.stringify({ images: webpImages })
    });

    console.log("Created FileImage:", fileImage);

    // ✅ Now assign fileImageId to each image in the Gallery table
    const galleryEntries = await Promise.all(
      webpImages.map(async imagePath => {
        const gallery = await Gallery.create({ imageUrl: imagePath, fileImageId: fileImage.id });
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


const getAllPhotos = async (req, res) => {
  try {
    const galleries = await FileImage.findAll({
      attributes: ["id", "outputPath"],
      include: [
        {
          model: Gallery,
          attributes: ["id", "imageUrl"]
        }
      ]
    });

    if (!galleries.length) {
      return res.status(404).json({ message: "No galleries found." });
    }

    console.log("Retrieved galleries:", JSON.stringify(galleries, null, 2));

    const formattedGalleries = galleries.map(gallery => ({
      galleryId: gallery.id,
      images: gallery.Galleries?.map(image => ({
        id: image.id,
        imageUrl: image.imageUrl
      })) || []
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

    // 🔍 Fetch gallery with images from Gallery table
    const fileImage = await FileImage.findByPk(galleryId, {
      attributes: ["id", "outputPath"],
      include: [
        {
          model: Gallery,
          attributes: ["id", "imageUrl"]
        }
      ]
    });

    if (!fileImage) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    // ✅ Extract images properly, ensuring database IDs are used
    const images = fileImage.Galleries?.map(image => ({
      id: image.id, // ✅ Use ID from Gallery table
      imageUrl: image.imageUrl
    })) || [];

    return res.status(200).json({
      galleryId: fileImage.id,
      images,
      message: "Gallery retrieved successfully!"
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
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

    // ✅ Ensure `outputPath.images` is properly handled
    let webpImagePaths = [];

    if (typeof fileImage.outputPath === "string") {
      try {
        const parsed = JSON.parse(fileImage.outputPath);
        webpImagePaths = parsed.images && Array.isArray(parsed.images) ? parsed.images : [];
      } catch (error) {
        console.error("Error parsing outputPath:", error);
      }
    } else if (fileImage.outputPath?.images && Array.isArray(fileImage.outputPath.images)) {
      webpImagePaths = fileImage.outputPath.images;
    }

    // ✅ Prevent errors if `webpImagePaths` is empty or undefined
    if (!webpImagePaths.length) {
      return res.status(400).json({ message: "No images found in the gallery to delete." });
    }

    // 🔥 Delete images from `Gallery`
    await Gallery.destroy({ where: { imageUrl: webpImagePaths } });

    // 🔥 Delete gallery record
    await fileImage.destroy();

    // 🔥 Delete images from filesystem
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "New image file is required." });
    }

    const newWebpImage = req.files.filename;

    const image = await Gallery.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const oldImagePath = `uploads/${image.imageUrl}`;

    await image.update({ imageUrl: newWebpImage });

    fs.unlink(oldImagePath, (err) => {
      if (err) console.error("Error deleting old file:", err);
    });
    console.log("Updated Image Data:", image);
    return res.status(200).json({ 
      id: image.id,
      image,
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
  getAllPhotos,
  deleteGalleryById, 
  getSingleImageById, 
  replaceImageById, 
  deleteImageById
};
