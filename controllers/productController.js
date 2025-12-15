const Product = require('../models/Product');

const productController = {
  // página de inventário com ações de gestão (dono/funcionario)
  inventory: async (req, res) => {
    try {
      const produtos = await Product.find().lean();
      return res.render('inventory', { produtos });
    } catch (err) {
      console.error('Erro carregando inventário:', err);
      return res.status(500).send('Erro ao carregar inventário');
    }
  },
  // lista produtos para a home
  list: async (req, res) => {
    try {
      const produtos = await Product.find().lean();
      // se não houver produtos no DB, deixa a view usar array vazio
      return res.render('index', { produtos });
    } catch (err) {
      console.error('Erro listando produtos:', err);
      return res.status(500).send('Erro ao listar produtos');
    }
  },

  getNewForm: (req, res) => res.render('productForm', { product: null }),

  create: async (req, res) => {
    try {
      const { nome, preco, descricao } = req.body;
      await Product.create({ nome, preco, descricao });
      return res.redirect('/');
    } catch (err) {
      console.error('Erro criando produto:', err);
      return res.status(500).send('Erro ao criar produto');
    }
  },

  getEditForm: async (req, res) => {
    try {
      const prod = await Product.findById(req.params.id).lean();
      if (!prod) return res.status(404).send('Produto não encontrado');
      return res.render('productForm', { product: prod });
    } catch (err) {
      console.error('Erro getEditForm:', err);
      return res.status(500).send('Erro ao carregar formulário');
    }
  },

  update: async (req, res) => {
    try {
      const { nome, preco, descricao } = req.body;
      await Product.findByIdAndUpdate(req.params.id, { nome, preco, descricao });
      return res.redirect('/');
    } catch (err) {
      console.error('Erro update produto:', err);
      return res.status(500).send('Erro ao atualizar produto');
    }
  },

  remove: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      return res.redirect('/');
    } catch (err) {
      console.error('Erro deletando produto:', err);
      return res.status(500).send('Erro ao deletar produto');
    }
  }
};

module.exports = productController;
