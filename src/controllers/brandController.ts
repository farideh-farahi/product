import { Request, Response } from 'express';
import { Brand } from '../models';

// Create Brand
export const createBrand = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const existingBrand = await Brand.findOne({ where: { name } });
    if (existingBrand) {
      return res.status(409).json({ success: false, msg: 'Brand name already exists!' });
    }

    const newBrand = await Brand.create({ name });
    return res.status(201).json({ success: true, msg: 'Brand created successfully!', brand: newBrand });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while creating Brand', error: err.message });
  }
};

// Get All Brands
export const getAllBrands = async (_req: Request, res: Response) => {
  try {
    const brands = await Brand.findAll();

    if (!brands.length) {
      return res.status(200).json({ success: true, msg: 'No brands found' });
    }

    return res.status(200).json({ success: true, brands });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while retrieving Brands', error: err.message });
  }
};

// Update Brand
export const updateBrand = async (req: Request, res: Response) => {
  const brand_id = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const brand = await Brand.findByPk(brand_id);
    if (!brand) {
      return res.status(404).json({ success: false, msg: 'Brand not found!' });
    }

    await brand.update({ name });
    return res.json({ success: true, msg: 'Brand updated successfully!', brand });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while updating brand', error: err.message });
  }
};

// Delete Brand
export const deleteBrand = async (req: Request, res: Response) => {
  const brand_id = req.params.id;

  try {
    const brand = await Brand.findByPk(brand_id);
    if (!brand) {
      return res.status(404).json({ success: false, msg: 'Brand not found' });
    }

    await brand.destroy();
    return res.json({ success: true, msg: 'Brand deleted successfully!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while deleting brand', error: err.message });
  }
};
