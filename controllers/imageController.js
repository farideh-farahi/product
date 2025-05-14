const { Product, Gallery } = require("../models");

// Upload Cover Image 
const uploadCover = async (req, res) => {
    const { id } = req.params;
    
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found!" });
        }

        product.cover = req.file.path; // Save file path
        await product.save();
        
        return res.json({ success: true, msg: "Cover updated successfully!", cover: product.cover });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while uploading cover", error: err.message });
    }
};
// 📌 Get Cover Image
const getCover = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product || !product.cover) {
            return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        res.sendFile(product.cover, { root: "." }); // Serve image file
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while retrieving cover", error: err.message });
    }
};
// 📌 Delete Cover Image
const deleteCover = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product || !product.cover) {
            return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        product.cover = null; // Remove image path
        await product.save();

        return res.json({ success: true, msg: "Cover deleted successfully!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, msg: "Server error while deleting cover", error: err.message });
    }
};

// Gallery Image Upload
const uploadGallery = async (req, res) => {
    const { id } = req.params;
    
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found!" });
        }

        const images = req.files.map(file => ({
            imagePath: file.path,
            productId: id,
        }));

        await Gallery.bulkCreate(images);
        return res.json({ success: true, msg: "Gallery updated successfully!", images });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while uploading gallery", error: err.message });
    }
};
const getGallery = async (req, res) => {
    const { id } = req.params;

    try {
        const images = await Gallery.findAll({ where: { productId: id } });

        if (images.length === 0) {
            return res.status(404).json({ success: false, msg: "No gallery images found!" });
        }

        return res.json({ success: true, images });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, msg: "Server error while fetching gallery", error: err.message });
    }
};

// 📌 Delete a Specific Image from Gallery
const deleteGalleryImage = async (req, res) => {
    const { id, imageId } = req.params;

    try {
        const image = await Gallery.findOne({ where: { id: imageId, productId: id } });

        if (!image) {
            return res.status(404).json({ success: false, msg: "Image not found!" });
        }

        await image.destroy();

        return res.json({ success: true, msg: "Image deleted from gallery!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, msg: "Server error while deleting gallery image", error: err.message });
    }
};
module.exports = {
    uploadCover,
    getCover,
    deleteCover,
    uploadGallery,
    getGallery,
    deleteGalleryImage
};