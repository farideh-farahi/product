const { Product, Brand, Category, Subcategory, FileImage , Gallery} = require("../models");

const createProduct = async (req, res) => {
  try {
    const { name, brandId, price, categoryId, subcategoryIds, attributes, status, cover, gallery } = req.body;

    if (!name || !brandId || !price || !categoryId || !Array.isArray(subcategoryIds) || !status) {
      return res.status(400).json({ success: false, msg: "Missing or invalid required fields!" });
    }

    const [brand, category, fileImage, validGalleryImages] = await Promise.all([
      Brand.findByPk(brandId),
      Category.findByPk(categoryId),
      cover ? FileImage.findByPk(cover) : Promise.resolve(null),
      gallery?.length ? FileImage.findAll({ where: { id: gallery } }) : Promise.resolve([]) 
    ]);

    if (!brand) return res.status(404).json({ success: false, msg: "Brand not found!" });
    if (!category) return res.status(404).json({ success: false, msg: "Category not found!" });
    if (cover && !fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
    if (gallery?.length && validGalleryImages.length !== gallery.length) {
      return res.status(400).json({ success: false, msg: "One or more gallery images are invalid!" });
    }

    const newProduct = await Product.create({ name, brandId, price, cover, categoryId, subcategoryIds, status });

    if (validGalleryImages.length > 0) {
      await Gallery.bulkCreate(validGalleryImages.map(fileImage => ({
        fileImageId: fileImage.id,
        productId: newProduct.id
      })));
    }

    return res.status(201).json({ success: true, msg: "Product created successfully!", product: newProduct });

  } catch (err) {
    console.error("Error creating product:", err);
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
      includeOptions.push({ model: Subcategory, attributes: ["id", "name"] });
    }

    const products = await Product.findAll({
      where: { status: 1 },
      attributes: ["id", "name", "price", "cover", "categoryId", "status"],
      include: includeOptions
    });

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return res.status(500).json({ success: false, msg: "Server error while fetching products", error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brandId, price, categoryId, subcategoryIds, status, cover, galleryIds } = req.body;

    if (!id || !name || !brandId || !price || !categoryId || !Array.isArray(subcategoryIds) || !status) {
      return res.status(400).json({ success: false, msg: "Missing or invalid required fields!" });
    }

    const [product, brand, category, fileImage] = await Promise.all([
      Product.findByPk(id),
      Brand.findByPk(brandId),
      Category.findByPk(categoryId),
      cover ? FileImage.findByPk(cover) : Promise.resolve(null)
    ]);

    if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });
    if (!brand) return res.status(404).json({ success: false, msg: "Brand not found!" });
    if (!category) return res.status(404).json({ success: false, msg: "Category not found!" });
    if (cover && !fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });

    await product.update({
      name,
      brandId,
      price,
      categoryId,
      subcategoryIds,
      status,
      cover: fileImage ? fileImage.id : null
    });


    await Gallery.destroy({ where: { productId: product.id } });

    if (Array.isArray(galleryIds) && galleryIds.length > 0) {
      await Gallery.bulkCreate(galleryIds.map(fileImageId => ({ fileImageId, productId: product.id })));
    }

    return res.status(200).json({
      success: true,
      msg: "Product updated successfully!",
      product
    });

  } catch (err) {
    console.error("Error updating product:", err);
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
