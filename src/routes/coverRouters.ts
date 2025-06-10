import express from "express" ;
import validateToken from "../middlewares/tokenValidation" ;

import {getProductCover} from "../controllers/coverController";

const router = express.Router();


router.get("/:productId", validateToken, getProductCover);


export default router;


