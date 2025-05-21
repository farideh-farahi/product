const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const validateToken = require ("../middlewares/tokenValidation")
const { createImage, 
    getAllImagesByProduct, 
    getImageById, 
    deleteImage } = require('../controllers/galleryController');

router.get('/product/:productId', getAllImagesByProduct);
router.get('/:id', getImageById);
router.post('/:id', validateToken, upload.single('file'), createImage);
router.delete('/:id', validateToken, deleteImage);

module.exports = router;
