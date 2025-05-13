const { where } = require("sequelize");
const { Subcategory, Category } = require("../models");

const createSubcategory = async (req, res) => {
    const { name, description, category_id } = req.body;

    if (!name || !description || !category_id) {
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" });
    }

    try {
        const categoryExists = await Category.findOne({ where: { id: category_id } });

        if (!categoryExists) {
            return res.status(404).json({ success: false, msg: "Category not found!" });
        }

        const newSubcategory = await Subcategory.create({ name, description, category_id});
        res.status(201).json({ success: true, msg: "Subcategory created successfully!", subcategory: newSubcategory });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while creating subcategory", error: err.message });
    }
};

const getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.findAll({
            include: {
                model: Category,
                attributes: ["id", "name"],
                where: {is_active : true}
            }

        });

        if (!subcategories || subcategories.length === 0) {
            return res.status(200).json({ success: true, msg: "No subcategories found" });
        }

        res.json({ success: true, subcategories });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while retrieving subcategories", error: err.message });
    }
};
const getSubcategoriesByCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findOne({
            where: { id , is_active: true},
            include: [
                {
                    model: Subcategory,

                }
            ]
        });

        if (!category) {
            return res.status(404).json({ success: false, msg: "Category not found" });
        }

        res.json({ success: true, category_name: category.name, subcategories: category.Subcategories });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while retrieving subcategories for category", error: err.message });
    }
};

const updateSubcategory = async (req, res) => {
    const { name, description, category_id} = req.body;

    if (!name || !description || !category_id) {
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" });
    }

    try {
        const subcategory = await Subcategory.findOne({ where: { id: req.params.id } });

        if (!subcategory) {
            return res.status(404).json({ success: false, msg: "Subcategory not found" });
        }

        await subcategory.update({ name, description, category_id });

        res.json({ success: true, msg: "Subcategory updated successfully!", subcategory });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while updating subcategory", error: err.message });
    }
};

const deleteSubcategory = async (req, res) => {
    const subcategory_id = req.params.id;

    try {
        const subcategory = await Subcategory.findOne({ where: { id: subcategory_id } });

        if (!subcategory) {
            return res.status(404).json({ success: false, msg: "Subcategory not found" });
        }

        await subcategory.destroy();
        res.json({ success: true, msg: "Subcategory deleted successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while deleting subcategory", error: err.message });
    }
};

module.exports = { createSubcategory, getAllSubcategories, getSubcategoriesByCategory, updateSubcategory, deleteSubcategory };