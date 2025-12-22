const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função auxiliar para deletar arquivo de imagem
function deleteImageFile(imagemPath) {
  if (!imagemPath) return;
  try {
    const filePath = path.join(__dirname, '..', 'public', imagemPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo deletado: ${filePath}`);
    }
  } catch (err) {
    console.error('Erro ao deletar arquivo de imagem:', err);
  }
}

// Configuração de upload com multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Apenas imagens são permitidas!'));
  }
});

const tiposProduto = ['Pokémon', 'Poké Ball', 'Medicamento', 'Berry', 'TM/HM', 'Item de Batalha', 'Outro'];

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

  getNewForm: (req, res) => res.render('productForm', { product: null, tiposProduto }),

  create: async (req, res) => {
    try {
      const { nome, preco, descricao, estoque, tipo } = req.body;
      const imagem = req.file ? '/uploads/' + req.file.filename : '';
      await Product.create({ 
        nome, 
        preco: parseFloat(preco) || 0, 
        descricao, 
        estoque: parseInt(estoque) || 0,
        tipo,
        imagem 
      });
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
      return res.render('productForm', { product: prod, tiposProduto });
    } catch (err) {
      console.error('Erro getEditForm:', err);
      return res.status(500).send('Erro ao carregar formulário');
    }
  },

  update: async (req, res) => {
    try {
      const { nome, preco, descricao, estoque, tipo } = req.body;
      const produtoAtual = await Product.findById(req.params.id);
      
      const dadosAtualizados = { 
        nome, 
        preco: parseFloat(preco) || 0, 
        descricao,
        estoque: parseInt(estoque) || 0,
        tipo
      };
      
      if (req.file) {
        // Se há imagem antiga, deletar antes de salvar a nova
        if (produtoAtual && produtoAtual.imagem) {
          deleteImageFile(produtoAtual.imagem);
        }
        dadosAtualizados.imagem = '/uploads/' + req.file.filename;
      }
      
      await Product.findByIdAndUpdate(req.params.id, dadosAtualizados);
      return res.redirect('/');
    } catch (err) {
      console.error('Erro update produto:', err);
      return res.status(500).send('Erro ao atualizar produto');
    }
  },

  remove: async (req, res) => {
    try {
      const prod = await Product.findById(req.params.id);
      if (prod && prod.imagem) {
        deleteImageFile(prod.imagem);
      }
      await Product.findByIdAndDelete(req.params.id);
      return res.redirect('/');
    } catch (err) {
      console.error('Erro deletando produto:', err);
      return res.status(500).send('Erro ao deletar produto');
    }
  }
};

module.exports = productController;
module.exports.upload = upload;
