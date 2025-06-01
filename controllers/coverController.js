const { FileImage , Product} = require("../models"); 

const assignCoverToProduct = async(req, res) => {
    try{
        const productId = req.params;
        const fileImageId = req.body;

        if (!Number.isInteger(fileImageId)) {
                return res.status(400).json({ success: false, msg: "Cover image must be assigned a single valid image ID!" });
        }

        const fileImage = await FileImage.findByPk(fileImageId);

        if (!fileImage) {
            return res.status(400).json({ success: false, msg: "Invalid fileImageId!" });
        }

        assignCoverImage(fileImage.userId, fileImageId);

        return res.status(201).json({
            success: true,
            msg: "Image assigned as cover!",
            fileImageId
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: "Server error while assigning image",
            error: err.message,
        });
    }
};

const getProductCover = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByPk(productId, {
            attributes: ["id", "name", "cover"],
            include: [{ model: FileImage, as: "CoverImage", attributes: ["id", "outputPath"] }]
        });

        if (!product || !product.CoverImage) {
            return res.status(404).json({ success: false, msg: "Cover image not found for this product." });
        }

        return res.status(200).json({
            success: true,
            productId,
            productName: product.name,
            coverImageUrl: product.CoverImage.outputPath,
            msg: "Cover image retrieved successfully!"
        });

    } catch (error) {
        console.error("Error fetching product cover:", error);
        return res.status(500).json({ success: false, msg: "Server error while fetching cover image", error: error.message });
    }
};


module.exports ={
    assignCoverToProduct,
  getProductCover
}