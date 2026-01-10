const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const cargosPermitidos = ['Gerente', 'Repositor', 'Atendente'];

function normalizarCargo(cargo) {
  if (!cargo) return '';
  const valor = cargo.toString().trim().toLowerCase();
  const encontrado = cargosPermitidos.find(
    permitido => permitido.toLowerCase() === valor
  );
  return encontrado || '';
}

const userController = {
  // 🔹 GET /api/users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().lean();
      res.json(users);
    } catch (error) {
      console.error('Erro em getAllUsers:', error);
      res.status(500).json({ erro: 'Erro ao buscar usuários' });
    }
  },

  // 🔹 GET /api/users/cargos
  getCargos: (req, res) => {
    res.json(cargosPermitidos);
  },

  // 🔹 POST /api/users
  createNewUser: async (req, res) => {
    try {
      let {
        nome_usuario: nome,
        email_usuario: email,
        cargo_usuario: cargo,
        senha_usuario: senha
      } = req.body;

      if (email) email = email.toLowerCase().trim();

      if (!email || !senha || !nome) {
        return res.status(400).json({ erro: 'Preencha nome, email e senha' });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      let roleToSet = 'comprador';
      if (req.session?.userRole === 'dono' && req.body.role) {
        const allowed = ['dono', 'funcionario', 'comprador'];
        if (allowed.includes(req.body.role)) roleToSet = req.body.role;
      }

      const cargoNormalizado = normalizarCargo(cargo);
      if (roleToSet === 'funcionario' && !cargoNormalizado) {
        return res.status(400).json({ erro: 'Cargo inválido' });
      }

      const createdUser = await User.create({
        nome,
        email,
        cargo: cargoNormalizado,
        password: hashedPassword,
        role: roleToSet
      });

      console.log(`[${new Date().toISOString()}] Novo usuário criado: ${email}`);

      res.status(201).json(createdUser);
    } catch (error) {
      console.error('Erro em createNewUser:', error);
      if (error?.code === 11000) {
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }
      res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
  },

  // 🔹 GET /api/users/:id
  getById: async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(user);
  },

  // 🔹 PUT /api/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const userAtual = await User.findById(id);
      if (!userAtual) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      const dadosAtualizados = {
        nome: req.body.nome_usuario
      };

      let roleEfetiva = userAtual.role;
      if (req.session?.userRole === 'dono' && req.body.role) {
        const allowed = ['dono', 'funcionario', 'comprador'];
        if (allowed.includes(req.body.role)) roleEfetiva = req.body.role;
      }

      const cargoNormalizado = normalizarCargo(req.body.cargo_usuario);
      if (roleEfetiva === 'funcionario' && !cargoNormalizado) {
        return res.status(400).json({ erro: 'Cargo inválido' });
      }

      dadosAtualizados.role = roleEfetiva;
      dadosAtualizados.cargo = cargoNormalizado;

      await User.findByIdAndUpdate(id, dadosAtualizados);

      res.json({ ok: true });
    } catch (error) {
      console.error('Erro em updateUser:', error);
      res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
  },

  // 🔹 DELETE /api/users/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      await User.findByIdAndDelete(id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Erro em deleteUser:', error);
      res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
  }
};

module.exports = userController;
