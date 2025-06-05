const { Product, Brand, Category, Subcategory, FileImage , Gallery} = require("../models");

const createProduct = async (req, res) => {
  try {
    const { name, brandId, price, cover, galleryIds, categoryId, subcategoryIds, status } = req.body;

    if (!name || !brandId || !price || !categoryId || !subcategoryIds || !status) {
      return res.status(400).json({ success: false, msg: "Missing required fields!" });
    }

    if (!Array.isArray(subcategoryIds)) {
      return res.status(400).json({ success: false, msg: "subcategoryIds must be an array!" });
    }

    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ success: false, msg: "Brand not found!" });
    if (!category) return res.status(404).json({ success: false, msg: "Category not found!" });

    let fileImage = null;
    if (cover) {
      fileImage = await FileImage.findByPk(cover);
      if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
    }

    let galleries = [];
    if (galleryIds && Array.isArray(galleryIds)) {
      galleries = await Gallery.findAll({ where: { id: galleryIds } });
      if (galleries.length !== galleryIds.length) {
        return res.status(404).json({ success: false, msg: "One or more gallery IDs are invalid!" });
      }
    }

    const newProduct = await Product.create({
      name,
      brandId,
      price,
      cover: fileImage ? fileImage.id : null,
      categoryId,
      subcategoryIds,
      status,
    });

    if (galleries.length) {
      await Promise.all(galleries.map(gallery => gallery.update({ productId: newProduct.id })));
    }

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
      { model: Gallery, attributes: ["id", "fileImageId"], as: "Galleries",
        include: [{ model: FileImage, attributes: ["id", "outputPath"] }]

      }
    ];

    if (isCat === "true") {
      includeOptions.push({ model: Category, attributes: ["id", "name"] });
    }
    if (isSub === "true") {
      includeOptions.push({ model: Subcategory, attributes: ["id", "name"],through: { attributes: [] } });
    }

    const products = await Product.findAll({
      where: { status: 1 },
      attributes: ["id", "name", "price", "cover", "categoryId", "status", "inventory"],
      include: includeOptions
    });

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return res.status(500).json({ success: false, msg: "Server error while fetching products", error: err.message });
  }
};

const getProductById = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByPk(productId, {
      attributes: ["id", "name", "price", "categoryId", "status", "inventory"], 
      include: [
        { model: Brand, attributes: ["id", "name"] },
        { model: FileImage, attributes: ["id", "outputPath"], as: "CoverImage" },
        {
          model: Gallery,
          attributes: ["id", "fileImageId"],
          as: "Galleries",
          include: [{ model: FileImage, attributes: ["id", "outputPath"] }]
        },
        { model: Category, attributes: ["id", "name"] },
        { model: Subcategory, attributes: ["id", "name"], through: { attributes: [] } }

      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, msg: "Product not found!" });
    }

    return res.status(200).json({ success: true, product });

  } catch (err) {
    console.error("Error in getProductById:", err);
    return res.status(500).json({ success: false, msg: "Server error while fetching product", error: err.message });
  }
};


const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, brandId, price, categoryId, subcategoryIds, status, cover, galleryIds } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

    let fileImage = null;
    if (cover) {
      fileImage = await FileImage.findByPk(cover);
      if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
    }
    if (!Array.isArray(subcategoryIds)) {
      return res.status(400).json({ success: false, msg: "subcategoryIds must be an array!" });
    }

    await product.update({
      name,
      brandId,
      price,
      categoryId,
      inventory,
      subcategoryIds,
      status,
      cover: fileImage ? fileImage.id : null, 
    });

    await Gallery.update({ productId: null }, { where: { productId: product.id } });


    if (galleryIds && Array.isArray(galleryIds) && galleryIds.length > 0) {
      await Promise.all(galleryIds.map(async (galleryId) => {
        await Gallery.update({ productId: product.id }, { where: { id: galleryId } });
      }));
    }

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
    getProductById,
    updateProduct,
    deleteProduct,
};
