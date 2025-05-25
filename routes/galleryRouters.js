const express = require('express');
const router = express.Router();
const { 
    createGallery,
    getGalleryById,
    getAllGalleries,
    getSingleImageById,
    deleteGalleryById,
    replaceImageById,
    deleteImageById
  } = require("../controllers/galleryController");
const validateToken = require("../middlewares/tokenValidation");
const { upload , convertToWebP } = require("../middlewares/uploadMiddleware")

router.post('/', validateToken, upload.any(), convertToWebP, createGallery);
router.get('/:galleryId',validateToken, getAllGalleries);
router.get('/all',validateToken, getGalleryById);
router.delete('/:galleryId', validateToken, deleteGalleryById);


router.get('/image/:imageId',validateToken, getSingleImageById);
router.put("/image/:imageId", validateToken, upload.single("file"), convertToWebP, replaceImageById);
router.delete('/image/:imageId', validateToken, deleteImageById);

module.exports = router;
