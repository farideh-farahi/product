const express = require("express");
const {createBrand, 
    getAllBrands, 
    updateBrand, 
    deleteBrand} = 
    require("../controllers/brandController");

const validateToken = require ("../middlewares/tokenValidation")


const router = express.Router();

//CRUD Routes for Brand
router.post("/",validateToken, createBrand);
router.get("/",validateToken, getAllBrands);
router.put("/:id",validateToken, updateBrand);
router.delete("/:id",validateToken, deleteBrand);

module.exports = router;