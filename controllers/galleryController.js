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

    const images = req.files.map(file => ({
      imageUrl: file.filename, // ✅ Uses converted WebP filename
      productId,
    }));

    const savedImages = await Gallery.bulkCreate(images);
    res.status(201).json(savedImages);
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
    if (!image) return res.status(404).json({ message: 'Image not found' });

    await image.destroy();
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createImage, getAllImagesByProduct, getImageById, deleteImage };
