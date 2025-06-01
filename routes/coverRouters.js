const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/tokenValidation");
const {assignCoverToProduct,getProductCover} = require ("../controllers/coverController")

router.post('/assign', validateToken, assignCoverToProduct)
router.get("/:productId", validateToken, getProductCover);


module.exports = router;


