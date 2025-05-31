const { FileImage, Product, Gallery } = require("../models")
const { assignCoverImage } = require("../utils/coverCache");


const uploadImage = async(req, res) => {
    try{
    const userId = req.user?.userId;

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
}catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Server error while uploading image",
      error: error.message,
    });
  }
}

const assignImage = async(req,res) => {
    try{
    const { fileImageId , type, productId } = req.body
    const fileImage = await FileImage.findByPk(fileImageId);

    if(!fileImage){
        return res.status(400).json({success: false, msg: "Invalid fileImageId!"})
    }
    if(type === "cover"){

        assignCoverImage(fileImage.userId, fileImageId);

    return res.status(201).json({
        success: true,
        msg: "Image assigned as cover!",
        fileImageId
    })
    }else if (type === "gallery"){
        if (productId){
            const productExists = await Product.findByPk(productId);
            if(!productExists){
                return res.status(201).json({success: false, msg: "Invalid productId! Product does not exist."})
            }
        }
        await Gallery.create({fileImageId, productId: productId || null})

        return res.status(201).json({
        success: true,
        msg: "Image assigned to gallery!",
      });
    } else {
      return res.status(400).json({ success: false, msg: "Invalid type specified!" });
    }
} catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Server error while assigning image",
      error: error.message,
    });
  }
};

module.exports = {
    uploadImage,
    assignImage
}