const { Product, Brand, Category, Subcategory, FileImage , Gallery} = require("../models");
const {Op} = require ("sequelize")
exports.createProduct = async (req, res) => {
  try {
    const { name, brandId, price, cover, galleryIds, categoryId, subcategoryIds, status, inventory } = req.body;

    if (!name || !brandId || !price || !categoryId || !subcategoryIds || !status) {
      return res.status(400).json({ success: false, msg: "Missing required fields!" });
    }

    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ success: false, msg: "Brand not found!" });

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ success: false, msg: "Category not found!" });

    let fileImage = null;
    if (cover) {
      fileImage = await FileImage.findByPk(cover);
      if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
    }

    // Ensure Inventory Uses Default or Provided Value
    const productInventory = inventory !== undefined ? inventory : 5;

    const newProduct = await Product.create({
      name,
      brandId,
      price,
      cover: fileImage ? fileImage.id : null,
      categoryId,
      subcategoryIds,
      status,
      inventory: productInventory, // Apply the correct inventory logic
    });

    if (subcategoryIds && Array.isArray(subcategoryIds)) {
      const validSubcategories = await Subcategory.findAll({ where: { id: subcategoryIds } });

      if (validSubcategories.length !== subcategoryIds.length) {
        return res.status(400).json({ success: false, msg: "One or more subcategory IDs are invalid!" });
      }

      await newProduct.setSubcategories(subcategoryIds);
    }

    let galleryImages = [];
    if (galleryIds && Array.isArray(galleryIds)) {
      const validImages = await FileImage.findAll({ where: { id: galleryIds } });
      if (validImages.length !== galleryIds.length) {
        return res.status(400).json({ success: false, msg: "One or more gallery IDs are invalid!" });
      }

      await Promise.all(validImages.map(image => Gallery.create({ fileImageId: image.id, productId: newProduct.id })));

      galleryImages = validImages.map(image => ({
        fileImageId: image.id,
        imageUrl: image.outputPath,
      }));
    }

    return res.status(201).json({
      success: true,
      msg: "Product created successfully!",
      product: {
        ...newProduct.toJSON(),
        gallery: galleryImages.length ? galleryImages : null,
      }
    });

  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ 
      success: false, 
      msg: "Server error while creating product", 
      error: err.errors ? err.errors.map(e => e.message) : err.message 
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { 
      isCat, 
      isSub,
      isGallery,
      isCover,
      limit = 20,
      page = 1,
      minPrice = 0,
      maxPrice = 999999, 
      search,
      order = "id",
      orderDir = "DESC"
    } = req.query;

    const includeOptions = [{ model: Brand, attributes: ["id", "name"] }];

    if (isCat === "true") {
      includeOptions.push({ model: Category, attributes: ["id", "name"] });
    }
    if (isSub === "true") {
      includeOptions.push({ model: Subcategory, attributes: ["id", "name"], through: { attributes: [] } });
    }

    if (isGallery === "true") {
      includeOptions.push({
        model: Gallery,
        attributes: ["id", "fileImageId"],
        as: "Galleries",
        include: [{ model: FileImage, attributes: ["id", "outputPath"] }]
      });
    }
    if (isCover === "true") {
      includeOptions.push({ model: FileImage, attributes: ["id", "outputPath"], as: "CoverImage" });
    }

    const limitValue = Number.isInteger(parseInt(limit, 10)) && parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 20;
    const pageValue = Number.isInteger(parseInt(page, 10)) && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const offsetValue = (pageValue - 1) * limitValue;

    // Handle invalid sorting fields
    const allowedOrders = ["id", "name", "price", "inventory"];
    const orderByField = allowedOrders.includes(order) ? order : "id";

    // Validate search query
    const searchFilter = search && typeof search === "string" && search.trim().length > 0 
      ? { [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { "$Brand.name$": { [Op.iLike]: `%${search}%` } }
        ]}
      : undefined;

    // Error handling for bad inputs
    if (limitValue < 1 || pageValue < 1) {
      return res.status(400).json({ success: false, msg: "Invalid pagination parameters" });
    }
    if (!allowedOrders.includes(order)) {
      return res.status(400).json({ success: false, msg: `Invalid order field: ${order}. Allowed values are ${allowedOrders.join(", ")}` });
    }

    // Execute query with validated inputs
    const products = await Product.findAll({
      where: {
        [Op.and]: [
          { status: 1 },
          { price: { [Op.between]: [minPrice, maxPrice] } },
          searchFilter
        ]
      },
      attributes: ["id", "name", "price", "cover", "categoryId", "status", "inventory"],
      include: includeOptions,
      limit: limitValue,
      offset: offsetValue,
      order: [[orderByField, orderDir]]
    });

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return res.status(500).json({ success: false, msg: "Server error while fetching products", error: err.message });
  }
};


exports.getProductById = async (req, res) => {
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

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, brandId, price, categoryId, subcategoryIds, status, cover, galleryIds, inventory } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, msg: "Product not found!" });

    if (!Array.isArray(subcategoryIds)) {
      return res.status(400).json({ success: false, msg: "subcategoryIds must be an array!" });
    }

    // Validate and assign Cover Image (if provided)
    let fileImage = null;
    if (cover) {
      fileImage = await FileImage.findByPk(cover);
      if (!fileImage) return res.status(404).json({ success: false, msg: "Cover image not found!" });
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

    // Remove previous gallery associations
    await Gallery.destroy({ where: { productId: product.id } });

    // Assign new Gallery Images (if provided)
    let galleryImages = [];
    if (galleryIds && Array.isArray(galleryIds) && galleryIds.length > 0) {
      const validImages = await FileImage.findAll({ where: { id: galleryIds } });
      if (validImages.length !== galleryIds.length) {
        return res.status(400).json({ success: false, msg: "One or more gallery IDs are invalid!" });
      }

      await Promise.all(validImages.map(image => Gallery.create({ fileImageId: image.id, productId: product.id })));

      galleryImages = validImages.map(image => ({
        fileImageId: image.id,
        imageUrl: image.outputPath,
      }));
    }

    return res.json({
      success: true,
      msg: "Product updated successfully!",
      product: {
        ...product.toJSON(),
        gallery: galleryImages.length ? galleryImages : null,
      }
    });

  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ 
      success: false, 
      msg: "Server error while updating product", 
      error: err.errors ? err.errors.map(e => e.message) : err.message 
    });
  }
};

exports.deleteProduct = async (req, res) => {
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


