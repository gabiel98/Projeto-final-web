// Migra roles antigos (admin/manager/customer) para novos (dono/funcionario/comprador)
// Execute com: node scripts/migrate-roles-ptbr.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const roleMap = {
  admin: 'dono',
  manager: 'funcionario',
  customer: 'comprador'
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const bulkOps = Object.entries(roleMap).map(([oldRole, newRole]) => ({
      updateMany: {
        filter: { role: oldRole },
        update: { $set: { role: newRole } }
      }
    }));

    const result = await User.bulkWrite(bulkOps, { ordered: false });
    console.log('Resultado da migração:', JSON.stringify(result, null, 2));

    const contagem = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('Contagem por role após migração:', contagem);
  } catch (err) {
    console.error('Erro na migração de roles:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
