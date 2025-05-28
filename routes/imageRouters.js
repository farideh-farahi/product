const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/tokenValidation");
const { upload, convertToWebP } = require("../middlewares/uploadMiddleware");
const {
  createCover,
  replaceCover,
  deleteCover,
  userImages
  } = require ("../controllers/coverController")

router.post("/", validateToken, upload.single("cover"), convertToWebP,createCover);

router.put("/:id", validateToken, upload.single("cover"), convertToWebP,replaceCover )

router.delete("/:id", validateToken, deleteCover);

router.get("/user/:userId", validateToken, userImages );

module.exports = router;
