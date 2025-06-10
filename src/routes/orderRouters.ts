import express from "express" ;
import { createOrder ,getAllOrders, getOrderById, updateOrder, deleteOrder} from "../controllers/orderController";

import validateToken from "../middlewares/tokenValidation" ;

const router = express.Router();


router.post("/", validateToken, createOrder);
router.get("/all", validateToken, getAllOrders);
router.get("/:orderId", validateToken, getOrderById);
router.put("/:orderId", validateToken, updateOrder);
router.delete("/:orderId", validateToken, deleteOrder);


export default router;
