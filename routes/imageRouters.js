
const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/tokenValidation");
const { upload, convertToWebP } = require("../middlewares/uploadMiddleware");
const {
    uploadImage,
    assignImage,
    getAllPhotos,
    getImageById,
    getImageByUserId,
    replaceImage,
    deleteImage
    } = require ("../controllers/imageController")
//POST 
router.post('/upload', validateToken, upload.any(), convertToWebP, uploadImage);
router.post('/assign', validateToken,assignImage );

//GET
router.get("/all", validateToken, getAllPhotos );
router.get("/:imageId", validateToken, getImageById );
router.get("/user/:userId", validateToken, getImageByUserId );

//PUT
router.put("/:fileImageId", validateToken, upload.single("file"), convertToWebP,replaceImage )

//DELETE
router.delete("/:fileImageId", validateToken, deleteImage);

module.exports = router;
