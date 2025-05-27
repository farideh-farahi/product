const express = require('express');
const router = express.Router();
const { 
    createGallery,
    getGalleryById,
    getAllPhotos,
    getSingleImageById,
    deleteGalleryById,
    replaceImageById,
    deleteImageById
  } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");
const { upload , convertToWebP } = require("../middlewares/uploadMiddleware")

router.post('/', validateToken, upload.any(), convertToWebP, createGallery);
router.get('/all',validateToken, getAllPhotos);
router.get('/:galleryId',validateToken, getGalleryById);
router.delete('/:galleryId', validateToken, deleteGalleryById);


router.get('/image/:imageId',validateToken, getSingleImageById);
router.put("/image/:imageId", validateToken, upload.any(), convertToWebP, replaceImageById);
router.delete('/image/:imageId', validateToken, deleteImageById);

module.exports = router;
