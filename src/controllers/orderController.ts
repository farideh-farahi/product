import { Request, Response } from 'express';
import { Order, Product, sequelize } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;
  const { cartItems } = req.body;

  const transaction = await sequelize.transaction();

  try {
    let totalAmount = 0;
    const orderId = uuidv4();
    const orderedProducts = [];

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product || product.inventory < item.quantity) {
        throw new Error(`Product ${product?.name || 'Unknown'} is out of stock.`);
      }

      product.inventory -= item.quantity;
      await product.save({ transaction });

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      const newOrder = await Order.create(
        {
          id: uuidv4(),
          orderId,
          userId,
          productId: item.productId,
          quantity: item.quantity,
          totalAmount: itemTotal,
        },
        { transaction }
      );

      orderedProducts.push({
        id: newOrder.id,
        orderId,
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalProduct: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      totalAmount,
      orderedProducts,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Validation error:', error);
    return res.status(400).json({
      error: error.errors ? error.errors.map((e: any) => e.message) : error.message,
    });
  }
};

// Get All Orders
export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      attributes: ['orderId', [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']],
      include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      group: ['orderId', 'Product.id'],
    });

    return res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get Order by ID
export const getOrderById = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const orders = await Order.findAll({
      where: { orderId },
      include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
    });

    if (!orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      orderId,
      totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalProduct: orders.reduce((sum, o) => sum + o.quantity, 0),
      Products: orders.map((o) => ({
        id: o.Product.id,
        name: o.Product.name,
        price: o.Product.price,
        quantity: o.quantity,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Update Order
export const updateOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { productId, quantity } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const orders = await Order.findAll({ where: { orderId }, transaction });

    if (!orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders.find((o) => o.productId === productId);
    if (!order) return res.status(404).json({ message: 'Product not found in this order' });

    const product = await Product.findByPk(productId, { transaction });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.inventory + order.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    product.inventory += order.quantity - quantity;
    await product.save({ transaction });

    order.quantity = quantity;
    order.totalAmount = product.price * quantity;
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: 'Order updated successfully',
      orderId,
      updatedProduct: {
        id: order.id,
        productId,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating order:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const orders = await Order.findAll({ where: { orderId }, transaction });

    if (!orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    for (const order of orders) {
      const product = await Product.findByPk(order.productId, { transaction });
      if (product) {
        product.inventory += order.quantity;
        await product.save({ transaction });
      }

      await order.destroy({ transaction });
    }

    await transaction.commit();
    return res.status(200).json({ message: 'Order deleted successfully', orderId });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting order:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
