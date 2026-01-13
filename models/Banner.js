const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imagem: { type: String, required: true }, // URL/caminho da imagem
  ordem: { type: Number, default: 0 }, // Para ordenar os banners
  ativo: { type: Boolean, default: true },
  criadoEm: { type: Date, default: Date.now }
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
