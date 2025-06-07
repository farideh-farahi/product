const { Order, Product, sequelize } = require("../models");
const { v4: uuidv4 } = require('uuid');

exports.createOrder = async (req, res) => {
    const userId = req.user?.user_id;
    const { cartItems } = req.body;
    const transaction = await sequelize.transaction();

    try {
        let totalAmount = 0;
        const orderId = uuidv4();

        let orderedProducts = [];

        for (let item of cartItems) {
            let product = await Product.findByPk(item.productId, { transaction });

            if (!product || product.inventory < item.quantity) {
                throw new Error(`Product ${product?.name || "Unknown"} is out of stock.`);
            }

            product.inventory -= item.quantity;
            await product.save({ transaction });

            let productTotal = product.price * item.quantity;
            totalAmount += productTotal;

            const newOrder = await Order.create({
                id: uuidv4(),
                orderId,
                userId,
                productId: item.productId,
                quantity: item.quantity,
                totalAmount: productTotal,
            }, { transaction });

            orderedProducts.push({
                id: newOrder.id, 
                orderId, 
                productId: item.productId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                totalPrice: productTotal
            });
        }

        await transaction.commit();
        return res.status(201).json({ 
            message: "Order placed successfully",
            totalProduct: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            orderId,
            totalAmount,
            orderedProducts
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Validation error:", error);
        return res.status(400).json({ 
            error: error.errors ? error.errors.map(e => e.message) : error.message 
        });
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: ["orderId", [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"]],
            include: [{ model: Product, attributes: ["id", "name", "price"] }],
            group: ["orderId", "Product.id"]
        });

        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return res.status(500).json({ error: error.message });
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const orders = await Order.findAll({
            where: { orderId },
            include: [{ model: Product, attributes: ["id", "name", "price"] }]
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            orderId,
            totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            totalProduct: orders.reduce((sum, order) => sum + order.quantity, 0),
            Products: orders.map(order => ({
                id: order.Product.id,
                name: order.Product.name,
                price: order.Product.price,
                quantity: order.quantity
            }))
        });

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({ error: error.message });
    }
};


exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const orders = await Order.findAll({ where: { orderId }, transaction });

        if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

        const order = orders.find(order => order.productId === productId);
        if (!order) return res.status(404).json({ message: "Product not found in this order" });

        const product = await Product.findByPk(productId, { transaction });
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.inventory + order.quantity < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // ✅ Adjust inventory before updating quantity
        product.inventory += order.quantity - quantity;
        await product.save({ transaction });

        // ✅ Update only this product's quantity while keeping `orderId`
        order.quantity = quantity;
        order.totalAmount = product.price * quantity;
        await order.save({ transaction });

        await transaction.commit();
        return res.status(200).json({
            message: "Order updated successfully",
            orderId,
            updatedProduct: {
                id: order.id,
                productId,
                quantity: order.quantity,
                totalAmount: order.totalAmount
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating order:", error);
        return res.status(500).json({ error: error.message });
    }
};


exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const orders = await Order.findAll({ where: { orderId }, transaction });

        if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

        for (const order of orders) {
            const product = await Product.findByPk(order.productId, { transaction });

            if (product) {
                // ✅ Restore inventory for each product in the order
                product.inventory += order.quantity;
                await product.save({ transaction });
            }

            await order.destroy({ transaction });
        }

        await transaction.commit();
        return res.status(200).json({ message: "Order deleted successfully", orderId });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting order:", error);
        return res.status(500).json({ error: error.message });
    }
};




