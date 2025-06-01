const fs = require("fs");
const { Gallery, FileImage, Product } = require("../models");

const assignGalleryToProduct = async(req, res) => {
  try{
      const productId = req.params;
      const fileImageId = req.body;

      const imageIds = Array.isArray(fileImageId) ? fileImageId : [fileImageId];

      const fileImages = await FileImage.findAll({ where: { id: imageIds } });
      if (fileImages.length !== imageIds.length) {
          return res.status(400).json({ success: false, msg: "One or more fileImageIds are invalid!" });
      }

      if (productId) {
          const productExists = await Product.findByPk(productId);
          if (!productExists) {
              return res.status(400).json({ success: false, msg: "Invalid productId! Product does not exist." });
          }
      }
      await Promise.all(
          fileImages.map(async (fileImage) => {
              await Gallery.create({ fileImageId: fileImage.id, productId: productId || null });
          })
      );

      return res.status(201).json({
          success: true,
          msg: "Images assigned to gallery!",
          assignedImages: imageIds
      });

      }catch (err) {
        return res.status(500).json({
            success: false,
            msg: "Server error while assigning image",
            error: err.message,
        });
    }
};

const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.findAll({
      attributes: ["id", "productId", "fileImageId"],
      include: [{ model: FileImage, attributes: ["id", "outputPath"] }]
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: "No galleries found." });
    }

    const groupedGalleries = galleries.reduce((acc, gallery) => {
      const key = gallery.productId || "unassigned";
      if (!acc[key]) acc[key] = [];

      acc[key].push({
        galleryId: gallery.id,
        fileImageId: gallery.fileImageId,
        imageUrl: gallery.FileImage?.outputPath,
      });

      return acc;
    }, {});

    return res.status(200).json({ success: true, galleries: groupedGalleries, msg: "Galleries retrieved successfully!" });

  } catch (error) {
    console.error("Error fetching galleries:", error);
    return res.status(500).json({ success: false, msg: "Server error while fetching galleries", error: error.message });
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

module.exports = {
  assignGalleryToProduct,
  getAllGalleries,
  getGalleryByProductId,
  deleteGalleryByProductId, 
};
