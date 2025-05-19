const {Category, Subcategory, sequelize} = require("../models")

const createCategory = async (req, res) => {
    const {name, description, is_active} = req.body
    if(!name || !description || typeof is_active !== "boolean"){
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" });
     }
     try {
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(409).json({ success: false, msg: "Category name already exists!" });
        }

        const newCategory = await Category.create({ name, description, is_active });
        res.status(201).json({ success: true, msg: "Category created successfully!", category: newCategory });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while creating category", error: err.message });
    }
}

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { is_active: true },
            include: [
                {
                    model: Subcategory,
                    attributes: [] 
                }
            ],
            attributes: [
                "id",
                "name",
                "description",
                [sequelize.fn("COUNT", sequelize.col("Subcategories.id")), "subcategory_count"]
            ],
            group: ["Category.id"]
        });

        if (!categories || categories.length === 0) {
            return res.status(200).json({ success: true, msg: "No categories found" });
        }

        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error while retrieving categories", error: err.message });
    }
};

const updateCategory = async (req, res) => {
    const { name, description, is_active } = req.body;
  
    if(!name || !description || typeof is_active !== "boolean"){
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" })
    }
    try {
      const category = await Category.findOne({ where: { id: req.params.id } });
  
      if (!category) {
        return res.status(403).json({ success: false, msg: "You do not have permission to update this category" });
      }
  
      await category.update({ name, description, is_active });
  
      res.json({ success: true, msg: "category updated successfully!", category });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Server error while updating category", error: err.message });
    }
  };

  const deleteCategory = async (req, res) => {
    const category_id = req.params.id;
 
    try{
       const category = await Category.findOne({ where: { id: category_id} });
       if(!category){
          return res.status(404).json({success: false, msg:"category not found or you do not have permission to delete this category"})
       }
 
       await category.destroy();
       res.json({ success: true, msg: "category deleted successfully!" });
 
    }catch(err){
      res.status(500).json({ success: false, msg: "Server error while deleting category", error: err.message });
    }
 }

module.exports = {
    createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory}