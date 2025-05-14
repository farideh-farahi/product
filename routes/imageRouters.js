const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware"); // Middleware for file uploads
const { uploadCover, getCover, deleteCover, uploadGallery, getGallery, deleteGalleryImage } = require("../controllers/imageController"); // ✅ Import missing functions

/*
router.post("/:id/cover", upload.single("cover"), uploadCover);
router.get("/:id/cover", getCover);
router.delete("/:id/cover", deleteCover);

// Routes for Gallery Images
router.post("/:id/gallery", upload.array("gallery", 5), uploadGallery);
router.get("/:id/gallery", getGallery);
router.delete("/:id/gallery/:imageId", deleteGalleryImage);
*/
module.exports = router;