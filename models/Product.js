const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // título do produto
  descricao: { type: String },
  preco: { type: Number, required: true },
  estoque: { type: Number, required: true, default: 0 },
  imagem: { type: String }, // caminho ou URL da imagem
  tipo: { 
    type: String, 
    enum: ['Action Figure', 'Boneco', 'Pelúcia', 'Jogo Digital', 'Jogo Físico', 'Cartas', 'Acessórios', 'Roupas', 'Outro'],
    default: 'Outro'
  },
  criadoEm: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
