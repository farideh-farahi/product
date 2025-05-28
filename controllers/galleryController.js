const fs = require("fs");
const { Gallery, FileImage, Product } = require("../models");

//gallery 
const createGallery = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { productId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, msg: "No file uploaded!" });
    }

    if (productId) {
      const productExists = await Product.findByPk(productId);
      if (!productExists) {
        return res.status(400).json({ success: false, msg: "Invalid productId! Product does not exist." });
      }
    }

    const galleryEntries = await Promise.all(
      req.files.map(async (file) => {
        const fileImage = await FileImage.create({
          userId,
          outputPath: file.filename,
        });

        const gallery = await Gallery.create({
          fileImageId: fileImage.id,
          productId: productId || null,
        });

        return {
          fileImageId: fileImage.id,
          galleryId: gallery.id,
          imageUrl: fileImage.outputPath,
        };
      })
    );

    return res.status(201).json({
      productId: productId || null,
      images: galleryEntries,
      message: "Gallery created successfully!",
    });

  } catch (error) {
    console.error("Error creating gallery:", error);
    return res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
  }
};

const getAllPhotos = async (req, res) => {
  try {
    const galleries = await Gallery.findAll({
      attributes: ["id", "productId", "fileImageId"],
      include: [
        {
          model: FileImage,
          attributes: ["id", "outputPath"]
        }
      ]
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: "No galleries found." });
    }

    const groupedPhotos = galleries.reduce((acc, gallery) => {
      const key = gallery.productId || "unassigned"; 
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        galleryId: gallery.id, 
        fileImageId: gallery.fileImageId,
        imageUrl: gallery.FileImage?.outputPath,
      });
      return acc;
    }, {});

    return res.status(200).json({
      photos: groupedPhotos,
      message: "Photos retrieved successfully!",
    });

  } catch (error) {
    console.error("Error fetching photos:", error);
    return res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
  }
};

const updateGalleryProductId = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { productId } = req.body;

    if (productId) {
      const productExists = await Product.findByPk(productId);
      if (!productExists) {
        return res.status(404).json({ success: false, msg: "Invalid productId! Product does not exist." });
      }
    }

    const gallery = await Gallery.findByPk(galleryId);
    if (!gallery) {
      return res.status(404).json({ success: false, msg: "Gallery not found!" });
    }

    await gallery.update({ productId: productId || null });

    return res.status(200).json({
      success: true,
      galleryId: gallery.id,
      productId: gallery.productId,
      message: "Gallery updated successfully!",
    });

  } catch (error) {
    console.error("Error updating gallery:", error);
    return res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
  }
};

const getGalleryByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    const galleries = await Gallery.findAll({
      where: { productId: productId || null },
      attributes: ["id", "productId", "fileImageId"],
      include: [
        {
          model: FileImage,
          attributes: ["id", "outputPath"]
        }
      ]
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: "No images found for this product." });
    }

    const images = galleries.map(gallery => ({
      id: gallery.FileImage?.id,
      imageUrl: gallery.FileImage?.outputPath,
    }));

    return res.status(200).json({
      productId: productId || "unassigned",
      images,
      message: "Images retrieved successfully!",
    });

  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
  }
};

const deleteGalleryByProductId = async (req, res) => {
  try {
    const { productId } = req.params;


    const galleries = await Gallery.findAll({
      where: { productId: productId || null },
      include: [{ model: FileImage, attributes: ["id", "outputPath"] }]
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: "No images found for this product." });
    }

    const webpImagePaths = galleries.map(gallery => gallery.FileImage?.outputPath).filter(Boolean);

    await Gallery.destroy({ where: { productId } });

    await FileImage.destroy({ where: { id: galleries.map(gallery => gallery.fileImageId) } });


    webpImagePaths.forEach(imagePath => {
      const fullPath = `uploads/${imagePath}`;
      fs.unlink(fullPath, (err) => {
        if (err) console.error("Error deleting file from disk:", err);
      });
    });

    return res.status(200).json({
      success: true,
      msg: "Gallery and associated images deleted successfully!"
    });

  } catch (error) {
    console.error("Error deleting gallery:", error);
    return res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
  }
};

//single image
const getSingleImageById = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await FileImage.findByPk(imageId, {
      include: [{ model: Gallery, attributes: ["id", "productId", "fileImageId"] }]
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    return res.status(200).json({
      fileImageId: image.id, 
      galleryId: image.Gallery?.id, 
      productId: image.Gallery?.productId || "unassigned",
      imageUrl: image.outputPath,
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

    if (!req.file) {
      return res.status(400).json({ message: "New image file is required." });
    }

    const newWebpImage = req.file.filename;

    const image = await FileImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const oldImagePath = `uploads/${image.outputPath}`;

    await image.update({ outputPath: newWebpImage });

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

    const image = await FileImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const imagePath = `uploads/${image.outputPath}`;

    await Gallery.destroy({ where: { fileImageId: imageId } });

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
  getGalleryByProductId,
  updateGalleryProductId,
  getAllPhotos,
  deleteGalleryByProductId, 
  getSingleImageById, 
  replaceImageById, 
  deleteImageById
};
