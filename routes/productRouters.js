const express = require("express");
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require ("../controllers/productController")
const validateToken = require ("../middlewares/tokenValidation")

const router = express.Router();


router.post("/",validateToken, createProduct);
router.get("/all",validateToken, getAllProducts);
router.get('/:productId',validateToken, getProductById);
router.put("/:id",validateToken, updateProduct);
router.delete("/:id",validateToken, deleteProduct);



module.exports = router;


