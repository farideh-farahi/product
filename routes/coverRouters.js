const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/tokenValidation");
const {getProductCover} = require ("../controllers/coverController")


router.get("/:productId", validateToken, getProductCover);


module.exports = router;


