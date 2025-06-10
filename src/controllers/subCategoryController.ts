import { Request, Response } from 'express';
import { Subcategory, Category } from '../models';

// CREATE Subcategory
export const createSubcategory = async (req: Request, res: Response) => {
  const { name, description, categoryId } = req.body;

  if (!name || !description || !categoryId) {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, msg: 'Category not found!' });
    }

    const newSubcategory = await Subcategory.create({ name, description, categoryId });
    return res.status(201).json({ success: true, msg: 'Subcategory created successfully!', subcategory: newSubcategory });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while creating subcategory', error: err.message });
  }
};

// READ all Subcategories
export const getAllSubcategories = async (_req: Request, res: Response) => {
  try {
    const subcategories = await Subcategory.findAll({
      include: {
        model: Category,
        attributes: ['id', 'name'],
        where: { is_active: true },
      },
    });

    if (!subcategories.length) {
      return res.status(200).json({ success: true, msg: 'No subcategories found' });
    }

    return res.status(200).json({ success: true, subcategories });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while retrieving subcategories', error: err.message });
  }
};

// READ Subcategories by Category
export const getSubcategoriesByCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({
      where: { id, is_active: true },
      include: [{ model: Subcategory }],
    });

    if (!category) {
      return res.status(404).json({ success: false, msg: 'Category not found' });
    }

    return res.status(200).json({
      success: true,
      category_name: category.name,
      subcategories: category.Subcategories,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      msg: 'Server error while retrieving subcategories for category',
      error: err.message,
    });
  }
};

// UPDATE Subcategory
export const updateSubcategory = async (req: Request, res: Response) => {
  const { name, description, categoryId } = req.body;

  if (!name || !description || !categoryId) {
    return res.status(400).json({ success: false, msg: 'Invalid or missing required fields!' });
  }

  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, msg: 'Subcategory not found' });
    }

    await subcategory.update({ name, description, categoryId });

    return res.status(200).json({ success: true, msg: 'Subcategory updated successfully!', subcategory });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while updating subcategory', error: err.message });
  }
};

// DELETE Subcategory
export const deleteSubcategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, msg: 'Subcategory not found' });
    }

    await subcategory.destroy();
    return res.status(200).json({ success: true, msg: 'Subcategory deleted successfully!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error while deleting subcategory', error: err.message });
  }
};
