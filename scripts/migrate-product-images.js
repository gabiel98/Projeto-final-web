// Script para migrar caminhos de imagens de produtos
// De: /uploads/nome.jpg
// Para: /uploads/products/nome.jpg

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function migrateProductImages() {
  try {
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
      console.error('MONGODB_URI não está definido em .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Buscar produtos com caminhos antigos
    const products = await Product.find({ 
      imagem: { $regex: '^/uploads/[^/]+\\.(jpg|png|webp|jpeg|gif)$' } 
    });

    console.log(`📦 Encontrados ${products.length} produtos para migrar`);

    for (const product of products) {
      const oldPath = product.imagem;
      // Trocar /uploads/nome.jpg por /uploads/products/nome.jpg
      const newPath = oldPath.replace('/uploads/', '/uploads/products/');
      
      await Product.findByIdAndUpdate(product._id, { imagem: newPath });
      console.log(`✓ ${product.nome}: ${oldPath} → ${newPath}`);
    }

    console.log('✅ Migração concluída!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrateProductImages();
