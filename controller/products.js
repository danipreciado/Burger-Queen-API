const Product = require('../models/Product');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await Product.find();
      resp.status(200).json(products);
    } catch (error) {
      next(404);
    }
  },
  getProduct: async (req, resp, next) => {
    const { productId } = req.params;
    try {
      const product = await Product.findOne({ _id: productId });
      if (product) {
        resp.status(200).json(product);
      } else {
        resp.status(404).send('Producto no encontrado');
      }
    } catch (error) {
      next(404);
    }
  },

  postProduct: async (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;

    if (!name && !price && !image && !type) {
      return next(400);
    }

    const product = new Product({
      name,
      price,
      image,
      type,
      dataEntry: new Date(),

    });
    try {
      const existingProduct = await Product.findOne({ name });

      if (existingProduct) {
        resp.status(403).json({ error: 'Producto ya existe' });
      } else {
        const savedProduct = await product.save();
        resp.status(200);
        resp.json({ _id: savedProduct._id, name: savedProduct.name, price: savedProduct.price });
      }
    } catch (error) {
      next(error);
    }
  },
  patchProduct: async (req, resp, next) => {
    const { productId } = req.params;
    const {
      name, price, image, type,
    } = req.body;
    try {
      if (!name && !price && !image && !type) {
        return next(400);
      }
      const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { returnDocument: 'after' });
      resp.status(200).json(updatedProduct);
    } catch (error) {
      next(404);
    }
  },
  deleteProduct: async (req, resp, next) => {
    const { productId } = req.params;
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);
      resp.status(200).json(deletedProduct);
    } catch (error) {
      next(404);
    }
  },
};
