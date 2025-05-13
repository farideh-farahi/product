const express = require("express");
const { 
    createSubcategory, 
    getAllSubcategories, 
    getSubcategoriesByCategory, 
    updateSubcategory, 
    deleteSubcategory 
} = require("../controllers/subCategoryController");

const router = express.Router();

router.post("/", createSubcategory);
router.get("/", getAllSubcategories);
router.get("/category/:id", getSubcategoriesByCategory);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

module.exports = router;