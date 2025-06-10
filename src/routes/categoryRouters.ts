import express  from "express";
import {createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory,
    getCategoryMenu

} from ("../controllers/categoryController");

import validateToken from "../middlewares/tokenValidation"

import cacheMiddlewares from "../middlewares/cacheMiddleware"

const router = express.Router();

router.post("/", validateToken, createCategory);
router.get("/",validateToken,cacheMiddlewares, getAllCategories);
router.get("/menu",validateToken, getCategoryMenu);
router.put("/:id",validateToken, updateCategory);
router.delete("/:id",validateToken, deleteCategory);

export default router;