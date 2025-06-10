const express = require("express");
const {createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory,
    getCategoryMenu

} = 
    require("../controllers/categoryController");

const validateToken = require("../middlewares/tokenValidation")

const cacheMiddlewares = require("../middlewares/cacheMiddleware")

const router = express.Router();

router.post("/", validateToken, createCategory);
router.get("/",validateToken,cacheMiddlewares, getAllCategories);
router.get("/menu",validateToken, getCategoryMenu);
router.put("/:id",validateToken, updateCategory);
router.delete("/:id",validateToken, deleteCategory);

module.exports = router;