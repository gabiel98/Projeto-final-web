// controllers/cartController.js
// Carrinho mantido na sessão (API para React)

const Product = require('../models/Product');

const cartController = {
  // 🔹 Retorna o carrinho atual
  view: (req, res) => {
    const cart = req.session.cart || [];
    res.json(cart);
  },

  // 🔹 Adiciona produto ao carrinho
  add: async (req, res) => {
    try {
      // Garante que veio JSON no body
      if (!req.body || !req.body.productId) {
        return res.status(400).json({ erro: 'productId não enviado' });
      }

      const { productId } = req.body;

      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      req.session.cart = req.session.cart || [];

      req.session.cart.push({
        productId: product._id,
        nome: product.nome,
        preco: product.preco
      });

      req.session.save(() => res.json({ ok: true }));

    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      res.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
    }
  },

  // 🔹 Remove produto do carrinho por índice
  remove: (req, res) => {
    if (!req.body || typeof req.body.index === 'undefined') {
      return res.status(400).json({ erro: 'Index não enviado' });
    }

    const idx = Number(req.body.index);

    if (!isNaN(idx) && req.session.cart && req.session.cart.length > idx) {
      req.session.cart.splice(idx, 1);
    }

    req.session.save(() => res.json({ ok: true }));
  }
};

module.exports = cartController;
