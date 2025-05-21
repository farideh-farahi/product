const express = require('express');
const router = express.Router();
const { createImage, getAllImagesByProduct, getImageById, deleteImage, replaceImage } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");
const { upload , convertToWebP } = require("../middlewares/uploadMiddleware")

router.get('/product/:productId', getAllImagesByProduct);
router.get('/:id', getImageById);
router.put('/:id',replaceImage )
router.post('/', validateToken, upload.any(), convertToWebP, createImage);
router.delete('/:id', validateToken, deleteImage);

module.exports = router;
