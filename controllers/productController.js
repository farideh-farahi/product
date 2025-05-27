const { Product, Brand, Category, Subcategory, ProductSubcategory, FileImage , Gallery} = require("../models");

const createProduct = async (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { name, brandId, price, cover, galleryId, categoryId, subcategoryIds, status } = req.body;


    if (!name || !brandId || !price || !categoryId || !subcategoryIds || !status) {
        return res.status(400).json({ success: false, msg: "Missing required fields!" });
    }

    try {
        const brand = await Brand.findByPk(brandId);
        if (!brand) return res.status(404).json({ success: false, msg: "Brand not found!" });

        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(404).json({ success: false, msg: "Category not found!" });

        if (!Array.isArray(subcategoryIds)) {
            return res.status(400).json({ success: false, msg: "subcategoryIds must be an array!" });
        }

        for (const subcategoryId of subcategoryIds) {
            const subcategory = await Subcategory.findByPk(subcategoryId);
            if (!subcategory) return res.status(404).json({ success: false, msg: `Subcategory ${subcategoryId} not found!` });
        }
        const parsedSubcategoryIds = Array.isArray(subcategoryIds) ? subcategoryIds : JSON.parse(subcategoryIds);

        let fileImage = null;
        if (cover) {
            fileImage = await FileImage.findByPk(cover);
            if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        let gallery = null;
        if (galleryId) {
            gallery = await FileImage.findByPk(galleryId);
            if (!gallery) return res.status(404).json({ success: false, msg: "Gallery not found!" });
        }

        const newProduct = await Product.create({
            name,
            brandId,
            price,
            cover: fileImage ? fileImage.id : null,
            gallery: gallery ? gallery.id : null,
            categoryId,
            subcategoryIds,
            status,
        });

        await ProductSubcategory.bulkCreate(
            parsedSubcategoryIds.map(subcategoryId => ({
                productId: newProduct.id,
                subcategoryId,
            }))
        );


        return res.status(201).json({ success: true, msg: "Product created successfully!", product: newProduct });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, msg: "Server error while creating product", error: err.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { isCat, isSub } = req.query;
        const includeOptions = [
            { model: Brand, attributes: ["id", "name"] },
            { model: FileImage, attributes: ["id", "outputPath"], as: "CoverImage" },
            { model: FileImage, attributes: ["id", "outputPath"], as: "GalleryImages" } 
        ];

        if (isCat === "true") {
            includeOptions.push({ model: Category, attributes: ["id", "name"] });
        }
        if (isSub === "true") {
            includeOptions.push({ model: Subcategory, attributes: ["id", "name"] });
        }

        const products = await Product.findAll({
            where: { status: 1 },
            attributes: ["id", "name", "price", "cover", "gallery", "categoryId", "status"],
            include: includeOptions
        });

        return res.status(200).json({ success: true, products });
    } catch (err) {
        console.error("Error in getAllProducts:", err);
        return res.status(500).json({ success: false, msg: "Server error while fetching products", error: err.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, brandId, price, categoryId, subcategoryIds, status, cover } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

        if (cover) {
            const fileImage = await FileImage.findByPk(cover);
            if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        await product.update({
            name,
            brandId,
            price,
            categoryId,
            subcategoryIds,
            status,
            cover: cover || null,
        });

        return res.json({ success: true, msg: "Product updated successfully!", product });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while updating product", error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found!" });
        }

        await product.destroy();
        return res.json({ success: true, msg: "Product deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while deleting product", error: err.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
};
