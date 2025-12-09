// controllers/cartController.js
// Carrinho simples mantido na sessão
const Product = require('../models/Product');

const cartController = {
  view: (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
  },

  add: async (req, res) => {
    try {
      const productId = req.body.productId;
      const product = await Product.findById(productId).lean();
      if (!product) return res.status(404).send('Produto não encontrado');
      req.session.cart = req.session.cart || [];
      req.session.cart.push({ productId: product._id, nome: product.nome, preco: product.preco });
      return res.redirect('/');
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      return res.status(500).send('Erro ao adicionar ao carrinho');
    }
  },

  remove: (req, res) => {
    const idx = parseInt(req.body.index, 10);
    if (!isNaN(idx) && req.session.cart && req.session.cart.length > idx) {
      req.session.cart.splice(idx, 1);
    }
    return res.redirect('/cart');
  }
};

module.exports = cartController;
