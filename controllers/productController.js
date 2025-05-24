const { sequelize } = require("../models"); 
const { Op } = require("sequelize");
const { Product, Brand, Category, Subcategory, ProductSubcategory, FileImage , Gallery} = require("../models");

const createProduct = async (req, res) => {
    console.log("Headers:", req.headers);
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { name, brandId, price, cover, categoryId, subcategoryIds, status, gallery } = req.body;

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

        let fileImage = null;
        if (cover) {
            fileImage = await FileImage.findByPk(cover);
            if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        let galleryImages = [];
        if (gallery && !Array.isArray(gallery)) {
            gallery = gallery.split(",").map(Number); // ✅ Convert comma-separated string into an array
        }
        if (gallery.length > 0) {
            galleryImages = await FileImage.findAll({ where: { id: gallery } });

            if (galleryImages.length !== gallery.length) {
                return res.status(404).json({ success: false, msg: "One or more gallery images not found!" });
            }
        }
        gallery = Array.isArray(gallery) ? gallery.map(Number) : [];


        const newProduct = await Product.create({
            name,
            brandId,
            price,
            cover: fileImage ? fileImage.id : null,
            categoryId,
            subcategoryIds,
            status,
            gallery
        });

        await ProductSubcategory.bulkCreate(
            subcategoryIds.map(subcategoryId => ({
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
        console.log("Executing Product.findAll() query...");

        const products = await Product.findAll({
            where: { status: 1 },
            attributes: [
                "id", "name", "price", "cover",
                [sequelize.literal(`string_to_array(gallery, ',')::INTEGER[]`), "gallery"]
            ],
            include: [
                { model: Brand, attributes: ["id", "name"] },
                { model: FileImage, attributes: ["id", "outputPath"], as: "CoverImage" }
            ]
        });



        // 🔹 بعد از دریافت `products`، مقدار `gallery` رو پردازش کن:
        for (let product of products) {
            if (typeof product.gallery === "string") {
                product.gallery = product.gallery.replace(/[{}]/g, "").split(",").map(Number);
            } else if (!Array.isArray(product.gallery)) {
                product.gallery = [];
            }

            console.log("Gallery after conversion:", product.gallery);

            if (product.gallery.length > 0) {
                const galleryImages = await FileImage.findAll({
                    where: { id: { [Op.any]: product.gallery } }
                });
                product.dataValues.GalleryImages = galleryImages;
            } else {
                product.dataValues.GalleryImages = [];
            }
        }

        return res.status(200).json({ success: true, products });
    } catch (err) {
        console.error("Error in getAllProducts:", err);
        return res.status(500).json({ success: false, msg: "Server error while fetching products", error: err.message });
    }
};




const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, brandId, price, categoryId, subcategoryIds, status, cover, gallery } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

        if (cover) {
            const fileImage = await FileImage.findByPk(cover);
            if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
        }

        // ✅ Ensure gallery stays an array
        await product.update({
            name,
            brandId,
            price,
            categoryId,
            subcategoryIds,
            status,
            cover: cover || null,
            gallery: Array.isArray(gallery) ? gallery : product.gallery,
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
