import express from "express" ;
import { 
    createSubcategory, 
    getAllSubcategories, 
    getSubcategoriesByCategory, 
    updateSubcategory, 
    deleteSubcategory 
} from "../controllers/subCategoryController");
import validateToken from "../../middlewares/tokenValidation")
import cacheMiddlewares from "../../middlewares/cacheMiddleware")

const router = express.Router();

router.post("/",validateToken, createSubcategory);
router.get("/",validateToken,cacheMiddlewares, getAllSubcategories);
router.get("/category/:id",validateToken, getSubcategoriesByCategory);
router.put("/:id",validateToken, updateSubcategory);
router.delete("/:id",validateToken, deleteSubcategory);

export default router;