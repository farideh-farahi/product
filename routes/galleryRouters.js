const express = require('express');
const router = express.Router();
const { 
    createGallery,
    getGalleryByProductId,
    updateGalleryProductId,
    getAllPhotos,
    getSingleImageById,
    deleteGalleryByProductId,
    replaceImageById,
    deleteImageById
  } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");
const { upload , convertToWebP } = require("../middlewares/uploadMiddleware")

router.post('/', validateToken, upload.any(), convertToWebP, createGallery);
router.get('/all',validateToken, getAllPhotos);
router.get('/:productId',validateToken, getGalleryByProductId);
router.put('/:galleryId', validateToken, updateGalleryProductId);
router.delete('/:productId', validateToken, deleteGalleryByProductId);


router.get('/image/:imageId',validateToken, getSingleImageById);
router.put("/image/:imageId", validateToken, upload.any(), convertToWebP, replaceImageById);
router.delete('/image/:imageId', validateToken, deleteImageById);

module.exports = router;
