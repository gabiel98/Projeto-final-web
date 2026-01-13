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
        preco: product.preco,
        imagem: product.imagem
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
  },

  // 🔹 Processa a compra (checkout)
  checkout: async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ erro: 'Faça login para finalizar a compra' });
      }

      const cart = req.session.cart || [];

      if (!cart || cart.length === 0) {
        return res.status(400).json({ erro: 'Carrinho vazio' });
      }

      // Atualizar estoque de cada produto
      for (const item of cart) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return res.status(404).json({ erro: `Produto ${item.nome} não encontrado` });
        }

        if (product.estoque < 1) {
          return res.status(400).json({ erro: `Produto ${item.nome} sem estoque` });
        }

        // Diminuir estoque em 1
        product.estoque -= 1;
        await product.save();
      }

      // Limpar carrinho após compra bem-sucedida
      req.session.cart = [];
      req.session.save(() => res.json({ ok: true, message: 'Compra realizada com sucesso!' }));

    } catch (err) {
      console.error('Erro ao processar compra:', err);
      res.status(500).json({ erro: 'Erro ao processar compra' });
    }
  }
};

module.exports = cartController;
