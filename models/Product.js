const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: String, required: true },
  descricao: { type: String },
  criadoEm: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
