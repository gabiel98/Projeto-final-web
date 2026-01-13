const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/banners/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBanner = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Apenas imagens são permitidas'));
  }
});

const bannerController = {
  // Listar todos os banners ativos
  list: async (req, res) => {
    try {
      const banners = await Banner.find({ ativo: true }).sort({ ordem: 1 }).lean();
      res.json(banners);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar banners' });
    }
  },

  // Listar todos (incluindo inativos) - admin only
  listAll: async (req, res) => {
    try {
      const banners = await Banner.find().sort({ ordem: 1 }).lean();
      res.json(banners);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar banners' });
    }
  },

  // Criar banner
  create: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Imagem é obrigatória' });
      }

      const banner = await Banner.create({
        imagem: '/uploads/banners/' + req.file.filename,
        ordem: req.body.ordem || 0,
        ativo: true
      });

      res.status(201).json(banner);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao criar banner' });
    }
  },

  // Atualizar banner
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.file) {
        updateData.imagem = '/uploads/banners/' + req.file.filename;
      }
      if (req.body.ordem !== undefined) {
        updateData.ordem = req.body.ordem;
      }
      if (req.body.ativo !== undefined) {
        updateData.ativo = req.body.ativo === 'true' || req.body.ativo === true;
      }

      const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
      if (!banner) {
        return res.status(404).json({ erro: 'Banner não encontrado' });
      }

      res.json(banner);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao atualizar banner' });
    }
  },

  // Deletar banner
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findByIdAndDelete(id);
      
      if (!banner) {
        return res.status(404).json({ erro: 'Banner não encontrado' });
      }

      res.json({ mensagem: 'Banner excluído com sucesso' });
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao excluir banner' });
    }
  }
};

module.exports = { bannerController, uploadBanner };
