const Order = require('../models/Order');

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await Order.find();
      resp.status(200).json(orders);
    } catch (error) {
      next(404);
    }
  },
  getOrder: async (req, resp, next) => {
    const { orderId } = req.params;
    try {
      const orderExists = await Order.findById(orderId);
      if (!orderExists) {
        return next(404);
      }
      const order = await Order.findById(orderId).populate('products.product');
      resp.status(200).json(order);
    } catch (error) {
      next(404);
    }
  },
  postOrder: async (req, resp, next) => {
    const {
      userId, client, products, status,
    } = req.body;

    if ((!client && !products) || products.length === 0) {
      return next(400);
    }

    if (products === []) {
      return next(400);
    }

    const productRefs = products.map((product) => ({
      qty: product.qty,
      product: product.product,
    }));
    const order = new Order({
      userId,
      client,
      products: productRefs,
      status,
      dateEntry: new Date(),
    });

    try {
      const savedOrder = await order.save();
      await savedOrder.populate('products.product');

      /* resp.status(200).json({
        userId,
        _id: savedOrder._id,
        client,
        products: savedOrder.products,
        status,
        dateEntry: savedOrder.dateEntry,
      }); */
      resp.status(200).json(savedOrder);
    } catch (error) {
      next(404);
    }
  },
  patchOrder: async (req, resp, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatus = ['pending', 'canceled', 'delivering', 'delivered'];

    try {
      const orderExists = await Order.findById(orderId);
      if (!orderExists) {
        return next(404);
      }

      if (!status || !allowedStatus.includes(status)) {
        return next(400);
      }
      let updatedOrder;
      if (status === 'delivered') {
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status, dateProcessed: new Date() },
          { new: true },
        );
      }
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true },
      );

      /*  if (!updatedOrder) {
        return next(404);
      }
 */
      resp.status(200).json(updatedOrder);
    } catch (error) {
      next(404);
    }
  },
  deleteOrder: async (req, resp, next) => {
    const { orderId } = req.params;

    try {
      const deletedOrder = await Order.findByIdAndDelete(orderId);

      resp.status(200).json(deletedOrder);
    } catch (error) {
      next(404);
    }
  },
};
