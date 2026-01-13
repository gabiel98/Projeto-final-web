const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔹 Função auxiliar para deletar imagem
function deleteImageFile(imagemPath) {
  if (!imagemPath) return;
  try {
    const filePath = path.join(__dirname, '..', 'public', imagemPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo deletado: ${filePath}`);
    }
  } catch (err) {
    console.error('Erro ao deletar imagem:', err);
  }
}

// 🔹 Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/products/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Apenas imagens são permitidas'));
  }
});

const tiposProduto = [
  'Boneco', 'Pelúcia', 'Jogo Digital', 
  'Jogo Físico', 'Cartas', 'Acessórios', 'Roupas', 'Outro'
];

const productController = {
  // 🔹 Lista todos (home / inventário)
  list: async (req, res) => {
    try {
      const produtos = await Product.find().lean();
      res.json(produtos);
    } catch (err) {
      console.error('Erro listando produtos:', err);
      res.status(500).json({ erro: 'Erro ao listar produtos' });
    }
  },

  // 🔹 Retorna tipos (React form)
  tipos: (req, res) => {
    res.json(tiposProduto);
  },

  // 🔹 Buscar um produto
  getById: async (req, res) => {
    try {
      const prod = await Product.findById(req.params.id).lean();
      if (!prod) return res.status(404).json({ erro: 'Produto não encontrado' });
      res.json(prod);
    } catch (err) {
      console.error('Erro buscando produto:', err);
      res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
  },

  // 🔹 Criar
  create: async (req, res) => {
    try {
      const { nome, preco, descricao, estoque, tipo } = req.body;
      const imagem = req.file ? '/uploads/products/' + req.file.filename : '';

      const produto = await Product.create({
        nome,
        preco: parseFloat(preco) || 0,
        descricao,
        estoque: parseInt(estoque) || 0,
        tipo,
        imagem
      });

      res.status(201).json(produto);
    } catch (err) {
      console.error('Erro criando produto:', err);
      res.status(500).json({ erro: 'Erro ao criar produto' });
    }
  },

  // 🔹 Atualizar
  update: async (req, res) => {
    try {
      const { nome, preco, descricao, estoque, tipo } = req.body;
      const produtoAtual = await Product.findById(req.params.id);

      if (!produtoAtual) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      const dados = {
        nome,
        preco: parseFloat(preco) || 0,
        descricao,
        estoque: parseInt(estoque) || 0,
        tipo
      };

      if (req.file) {
        if (produtoAtual.imagem) deleteImageFile(produtoAtual.imagem);
        dados.imagem = '/uploads/products/' + req.file.filename;
      }

      const atualizado = await Product.findByIdAndUpdate(
        req.params.id,
        dados,
        { new: true }
      );

      res.json(atualizado);
    } catch (err) {
      console.error('Erro atualizando produto:', err);
      res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
  },

  // 🔹 Remover
  remove: async (req, res) => {
    try {
      const prod = await Product.findById(req.params.id);
      if (!prod) return res.status(404).json({ erro: 'Produto não encontrado' });

      if (prod.imagem) deleteImageFile(prod.imagem);

      await Product.findByIdAndDelete(req.params.id);

      res.json({ ok: true });
    } catch (err) {
      console.error('Erro deletando produto:', err);
      res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
  }
};

module.exports = productController;
module.exports.upload = upload;
