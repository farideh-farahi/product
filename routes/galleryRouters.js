const express = require('express');
const router = express.Router();
const { 
    assignGalleryToProduct,
    getAllGalleries,
    getGalleryByProductId,
    deleteGalleryByProductId,
  } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");

router.post('/assign', validateToken, assignGalleryToProduct)
router.get('/all',validateToken, getAllGalleries);
router.get('/:productId',validateToken, getGalleryByProductId);
router.delete('/:productId', validateToken, deleteGalleryByProductId);

module.exports = router;
