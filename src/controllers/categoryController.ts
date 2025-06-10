import { Request, Response } from 'express';
import { Category, Subcategory, sequelize } from '../models';
import { col, fn } from 'sequelize';

// Create Category
export const createCategory = async (req: Request, res: Response) => {
  const { name, description, is_active } = req.body;

  if (!name || !description || typeof is_active !== 'boolean') {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, msg: 'Category name already exists!' });
    }

    const newCategory = await Category.create({ name, description, is_active });
    return res.status(201).json({ success: true, msg: 'Category created successfully!', category: newCategory });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while creating category', error: err.message });
  }
};

// Get All Categories with subcategory count
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [{ model: Subcategory, attributes: [] }],
      attributes: [
        'id',
        'name',
        'description',
        [fn('COUNT', col('Subcategories.id')), 'subcategory_count'],
      ],
      group: ['Category.id'],
    });

    if (!categories.length) {
      return res.status(200).json({ success: true, msg: 'No categories found' });
    }

    return res.status(200).json({ success: true, categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while retrieving categories', error: err.message });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  const { name, description, is_active } = req.body;

  if (!name || !description || typeof is_active !== 'boolean') {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(403).json({ success: false, msg: 'You do not have permission to update this category' });
    }

    await category.update({ name, description, is_active });
    return res.json({ success: true, msg: 'Category updated successfully!', category });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while updating category', error: err.message });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, msg: 'Category not found or permission denied' });
    }

    await category.destroy();
    return res.json({ success: true, msg: 'Category deleted successfully!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while deleting category', error: err.message });
  }
};

// Get Category Menu
export const getCategoryMenu = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [
        {
          model: Subcategory,
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: ['id', 'name', 'description'],
    });

    if (!categories.length) {
      return res.status(200).json({ success: true, msg: 'No categories found' });
    }

    const formattedMenu = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      subcategories: category.Subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
      })),
    }));

    return res.json({ success: true, menu: formattedMenu });
  } catch (err: any) {
    console.error('Error fetching category menu:', err.message);
    return res.status(500).json({ success: false, msg: 'Server error while retrieving menu', error: err.message });
  }
};
