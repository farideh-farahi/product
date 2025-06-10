import { Request, Response } from 'express';
import { Product, Brand, Category, Subcategory, FileImage, Gallery } from '../models';
import { Op } from 'sequelize';

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  const { name, brandId, price, cover, galleryIds, categoryId, subcategoryIds, status, inventory } = req.body;

  if (!name || !brandId || !price || !categoryId || !subcategoryIds || !status) {
    return res.status(400).json({ success: false, msg: 'Missing required fields!' });
  }

  try {
    const brand = await Brand.findByPk(brandId);
    if (!brand) return res.status(404).json({ success: false, msg: 'Brand not found!' });

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ success: false, msg: 'Category not found!' });

    const fileImage = cover ? await FileImage.findByPk(cover) : null;
    if (cover && !fileImage) return res.status(404).json({ success: false, msg: 'Cover image not found!' });

    const newProduct = await Product.create({
      name,
      brandId,
      price,
      cover: fileImage?.id ?? null,
      categoryId,
      subcategoryIds,
      status,
      inventory: inventory !== undefined ? inventory : 5,
    });

    if (Array.isArray(subcategoryIds)) {
      const validSubcategories = await Subcategory.findAll({ where: { id: subcategoryIds } });
      if (validSubcategories.length !== subcategoryIds.length) {
        return res.status(400).json({ success: false, msg: 'One or more subcategory IDs are invalid!' });
      }
      await newProduct.setSubcategories(subcategoryIds);
    }

    let galleryImages = [];
    if (Array.isArray(galleryIds)) {
      const validImages = await FileImage.findAll({ where: { id: galleryIds } });
      if (validImages.length !== galleryIds.length) {
        return res.status(400).json({ success: false, msg: 'One or more gallery IDs are invalid!' });
      }
      await Promise.all(validImages.map((image) =>
        Gallery.create({ fileImageId: image.id, productId: newProduct.id })
      ));
      galleryImages = validImages.map((image) => ({
        fileImageId: image.id,
        imageUrl: image.outputPath,
      }));
    }

    return res.status(201).json({
      success: true,
      msg: 'Product created successfully!',
      product: { ...newProduct.toJSON(), gallery: galleryImages.length ? galleryImages : null },
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while creating product',
      error: err.errors ? err.errors.map((e: any) => e.message) : err.message,
    });
  }
};
