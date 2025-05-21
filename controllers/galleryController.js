const path = require('path');
const { Gallery, Product } = require('../models');

const createImage = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // ✅ Find existing images for this product
    const existingImages = await Gallery.findAll({ where: { productId } });

    if (existingImages.length > 0) {
      // ✅ Delete old images from the file system
      existingImages.forEach(image => {
        const oldImagePath = path.join("uploads", image.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      });

      // ✅ Remove old images from the database
      await Gallery.destroy({ where: { productId } });
    }

    // ✅ Save new images
    const newImages = req.files.map(file => ({
      imageUrl: file.filename, // ✅ Uses converted WebP filename
      productId,
    }));

    const savedImages = await Gallery.bulkCreate(newImages);
    res.status(201).json({
      success: true,
      msg: "Image(s) replaced successfully!",
      images: savedImages,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllImagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const images = await Gallery.findAll({ where: { productId } });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Gallery.findByPk(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // ✅ Delete from file system
    const imagePath = path.join("uploads", image.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // ✅ Remove from database
    await image.destroy();
    res.status(200).json({ success: true, msg: "Image deleted successfully!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createImage, getAllImagesByProduct, getImageById, deleteImage };
