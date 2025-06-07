const express = require("express");
const { createOrder ,getAllOrders, getOrderById, updateOrder, deleteOrder} = require("../controllers/orderController");

const router = express.Router();
const validateToken = require("../middlewares/tokenValidation");


router.post("/", validateToken, createOrder);
router.get("/all", validateToken, getAllOrders);
router.get("/:orderId", validateToken, getOrderById);
router.put("/:orderId", validateToken, updateOrder);
router.delete("/:orderId", validateToken, deleteOrder);


module.exports = router;
