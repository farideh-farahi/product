import express from 'express';
import { register, login, logout } from '../controllers/authController';
import validateToken from '../middlewares/tokenValidation';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', validateToken, logout);

export default router;
