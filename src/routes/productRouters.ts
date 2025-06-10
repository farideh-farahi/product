import express from "express" ;
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController"
import validateToken from  "../middlewares/tokenValidation"
import cacheMiddlewares from "../middlewares/cacheMiddleware"

const router = express.Router();


router.post("/",validateToken, createProduct);
router.get("/all",validateToken,cacheMiddlewares, getAllProducts);
router.get('/:productId',validateToken, getProductById);
router.put("/:id",validateToken, updateProduct);
router.delete("/:id",validateToken, deleteProduct);


export default router;


