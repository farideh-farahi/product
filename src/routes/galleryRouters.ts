import express from "express" ;
import validateToken from "../middlewares/tokenValidation" ;
import { 
    getAllGalleries,
    getGalleryByProductId,
    deleteGalleryByProductId,
  } from "../controllers/galleryController";


const router = express.Router();


router.get('/all',validateToken, getAllGalleries);
router.get('/:productId',validateToken, getGalleryByProductId);
router.delete('/:productId', validateToken, deleteGalleryByProductId);

export default router;
