const express = require("express");
const {createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory} = 
    require("../controllers/categoryController");

const validateToken = require("../middlewares/tokenValidation")

const router = express.Router();

router.post("/", validateToken, createCategory);
router.get("/",validateToken, getAllCategories);
router.put("/:id",validateToken, updateCategory);
router.delete("/:id",validateToken, deleteCategory);

module.exports = router;