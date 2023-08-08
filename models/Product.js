const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  type: {
    type: String,
  },
  dataEntry: {
    type: Date,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
