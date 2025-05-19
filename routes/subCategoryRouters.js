const express = require("express");
const { 
    createSubcategory, 
    getAllSubcategories, 
    getSubcategoriesByCategory, 
    updateSubcategory, 
    deleteSubcategory 
} = require("../controllers/subCategoryController");
const validateToken = require ("../middlewares/tokenValidation")


const router = express.Router();

router.post("/",validateToken, createSubcategory);
router.get("/",validateToken, getAllSubcategories);
router.get("/category/:id",validateToken, getSubcategoriesByCategory);
router.put("/:id",validateToken, updateSubcategory);
router.delete("/:id",validateToken, deleteSubcategory);

module.exports = router;