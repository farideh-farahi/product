const express = require('express');
const{register, login, logout} = require("../controllers/authController")
const validateToken = require ("../middlewares/tokenValidation")

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout",validateToken, logout)


module.exports = router;
