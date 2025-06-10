
import express from "express" ;
import validateToken from "../middlewares/tokenValidation" ;
const { upload, convertToWebP } = require("../middlewares/uploadMiddleware");
const {
    uploadImage,
    getAllPhotos,
    getImageById,
    getImageByUserId,
    replaceImage,
    deleteImage
    } = require ("../controllers/imageController")

const router = express.Router();

//POST 
router.post('/upload', validateToken, upload.any(), convertToWebP, uploadImage);

//GET
router.get("/all", validateToken, getAllPhotos );
router.get("/:imageId", validateToken, getImageById );
router.get("/user/:userId", validateToken, getImageByUserId );

//PUT
router.put("/:fileImageId", validateToken, upload.single("file"), convertToWebP,replaceImage )

//DELETE
router.delete("/:fileImageId", validateToken, deleteImage);

export default router;
