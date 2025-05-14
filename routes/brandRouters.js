const express = require("express");
const {createBrand, 
    getAllBrands, 
    updateBrand, 
    deleteBrand} = 
    require("../controllers/brandController");

const router = express.Router();

//CRUD Routes for Brand
router.post("/", createBrand);
router.get("/", getAllBrands);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;