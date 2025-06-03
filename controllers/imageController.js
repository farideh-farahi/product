const { FileImage } = require("../models")
const fs = require ("fs")
const sharp = require ("sharp")
const path = require ("path")

const uploadImage = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, msg: "No files uploaded" });
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 500 * 1024);
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Some files exceed the 500 KB limit",
        oversizedFiles: oversizedFiles.map(file => file.originalname),
      });
    }

    const savedImages = [];

    // Process each file: rename, resize, and save to DB
    await Promise.all(files.map(async (file) => {
      const originalPath = `uploads/${Date.now()}-original.webp`;
      const tinyPath = `uploads/${Date.now()}-tiny.webp`;

      // Rename the uploaded file
      fs.renameSync(file.path, originalPath);

      // Create a tiny version
      await sharp(originalPath)
        .resize({ width: 100 })
        .webp({ quality: 80 })
        .toFile(tinyPath);

      // Save image info in the database
      const fileImage = await FileImage.create({
        userId,
        outputPath: path.basename(originalPath),
      });

      savedImages.push({
        fileImageId: fileImage.id,
        originalImagePath: path.basename(originalPath),
        tinyImagePath: path.basename(tinyPath),
      });
    }));

    return res.status(201).json({
      success: true,
      msg: "Files uploaded successfully",
      uploadedImages: savedImages,
    });

  } catch (err) {
    console.error("Error uploading images:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while uploading images",
      error: err.message,
    });
  }
};



const getAllPhotos = async (req, res) => {
    try {
        const photos = await FileImage.findAll({
            attributes: ["id", "outputPath"],
            order: [["id", "ASC"]]
        });

        if (!photos.length) {
            return res.status(404).json({ success: false, msg: "No photos found." });
        }

        return res.status(200).json({ 
            success: true, 
            photos: photos.map(photo => ({
                fileImageId: photo.id,
                imageUrl: photo.outputPath
            })), 
            msg: "Photos retrieved successfully!" 
        });

    } catch (err) {
        console.error("Error fetching photos:", err);
        return res.status(500).json({ 
            success: false, 
            msg: "Server error while fetching photos", 
            error: err.message 
        });
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
    getAllPhotos,
    getImageById,
    getImageByUserId,
    replaceImage,
    deleteImage
}