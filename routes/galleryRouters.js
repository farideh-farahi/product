const express = require('express');
const router = express.Router();
const { createImage, getImageById, deleteImage, replaceImage } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");
const { upload , convertToWebP } = require("../middlewares/uploadMiddleware")

router.post('/', validateToken, upload.any(), convertToWebP, createImage);
router.get('/image/:id', getImageById);
router.put('/:id',replaceImage )
router.delete('/:id', validateToken, deleteImage);

module.exports = router;
