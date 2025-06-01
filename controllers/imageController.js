const { FileImage, Product, Gallery } = require("../models")
const { assignCoverImage } = require("../utils/coverCache");
const fs = require ("fs")

const uploadImage = async(req, res) => {
    try{
    const userId = req.user?.user_id;

    if(!req.files || req.files.length === 0){
        return res.status(400).json({success: false, msg: "No file uplouded" })
    }

    const fileImages = await Promise.all(
        req.files.map(async (file) => {
            return await FileImage.create({userId, outputPath : file.filename })
        })
    )
    return res.status(201).json({
        success: true,
        msg: "File(s) uplouded successfully",
        fileImages: fileImages.map((file) =>({
            fileImageId: file.id,
            imageUrl: file.outputPath
        }))
    })
}catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Server error while uploading image",
      error: err.message,
    });
  }
}

const assignImage = async (req, res) => {
    try {
        const { fileImageId, type, productId } = req.body;

        if (type === "cover") {
            // Ensure `fileImageId` is a single number
            if (!Number.isInteger(fileImageId)) {
                return res.status(400).json({ success: false, msg: "Cover image must be assigned a single valid image ID!" });
            }

            // Validate image exists
            const fileImage = await FileImage.findByPk(fileImageId);
            if (!fileImage) {
                return res.status(400).json({ success: false, msg: "Invalid fileImageId!" });
            }

            // Assign the cover image
            assignCoverImage(fileImage.userId, fileImageId);

            return res.status(201).json({
                success: true,
                msg: "Image assigned as cover!",
                fileImageId
            });

        } else if (type === "gallery") {
            // Ensure `fileImageId` is an array
            const imageIds = Array.isArray(fileImageId) ? fileImageId : [fileImageId];

            // Validate images exist
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

            // Assign multiple images to the gallery
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

        } else {
            return res.status(400).json({ success: false, msg: "Invalid type specified!" });
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: "Server error while assigning image",
            error: err.message,
        });
    }
};

const getAllPhotos = async (req, res) => {
    try {
        const galleries = await Gallery.findAll({
            attributes: ["id", "productId", "fileImageId"],
            include: [{ model: FileImage, attributes: ["id", "outputPath"] }]
        });

        if (!galleries.length) {
            return res.status(404).json({ success: false, msg: "No galleries found." });
        }

        const groupedPhotos = galleries.reduce((acc, gallery) => {
            const key = gallery.productId || "unassigned"; 
            if (!acc[key]) acc[key] = [];
            
            acc[key].push({
                galleryId: gallery.id, 
                fileImageId: gallery.fileImageId,
                imageUrl: gallery.FileImage?.outputPath,
            });

            return acc;
        }, {});

        return res.status(200).json({ success: true, photos: groupedPhotos, msg: "Photos retrieved successfully!" });

    } catch (err) {
        console.error("Error fetching photos:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while fetching photos", 
            error: err.message });
    }
};

const getImageById = async (req, res) => {
    try {
        const { imageId } = req.params;

        const image = await FileImage.findByPk(imageId);

        if (!image) {
            return res.status(404).json({ success: false, msg: "Image not found." });
        }

        return res.status(200).json({
            success: true,
            fileImageId: image.id,
            imageUrl: image.outputPath,
            msg: "Image retrieved successfully!"
        });

    } catch (err) {
        console.error("Error fetching image:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while fetching image", 
            error: err.message });
    }
};

const getImageByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const images = await FileImage.findAll({
            where: { userId },
            attributes: ["id", "outputPath"]
        });

        if (!images.length) {
            return res.status(404).json({ success: false, msg: "No images found for this user." });
        }

        return res.status(200).json({ success: true, userId, images, msg: "User images retrieved successfully!" });

    } catch (err) {
        console.error("Error fetching user images:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while fetching user images", 
            error: err.message });
    }
};

const replaceImage = async (req, res) => {
    try{
    const { fileImageId } = req.params

    if(!req.file){
    return res.status(400).json({success: false, msg: "No file uplouded" })
    }

    const newImagePath = req.file.filename
    const image = await FileImage.findByPk(fileImageId)
    if(!image){
        return res.status(404).json({success: false, msg: "Image not found"})
    }

    const oldImagePath = `uploads/${image.outputPath}`

    await image.update ({ outputPath: newImagePath })

    fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old file:", err);
    })

    return res.status(200).json({
            success: true,
            fileImageId: image.id,
            newImageUrl: newImagePath,
            msg: "Image replaced successfully!"
        });

    } catch (err) {
        console.error("Error replacing image:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while replacing image", 
            error: err.message });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { fileImageId } = req.params;

        const image = await FileImage.findByPk(fileImageId);

        if (!image) {
            return res.status(404).json({ success: false, msg: "Image not found." });
        }

        const imagePath = `uploads/${image.outputPath}`;

        await image.destroy();

        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting file from disk:", err);
        });

        return res.status(200).json({ success: true, msg: "Image deleted successfully!" });

    } catch (err) {
        console.error("Error deleting image:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while deleting image", 
            error: err.message });
    }
};


module.exports = {
    uploadImage,
    assignImage,
    getAllPhotos,
    getImageById,
    getImageByUserId,
    replaceImage,
    deleteImage
}