import express from 'express';
import {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController';
import validateToken from '../middlewares/tokenValidation';
import cacheMiddlewares from '../middlewares/cacheMiddleware';

const router = express.Router();

router.post('/', validateToken, createBrand);
router.get('/', validateToken, cacheMiddlewares, getAllBrands);
router.put('/:id', validateToken, updateBrand);
router.delete('/:id', validateToken, deleteBrand);

export default router;
