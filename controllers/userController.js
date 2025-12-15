const User = require('../models/User');
const bcrypt = require('bcryptjs'); // biblioteca para hash/compare de senhas
const mongoose = require('mongoose');

// Cargos permitidos para funcionários (role: funcionario)
const cargosPermitidos = ['Gerente', 'Repositor', 'Atendente'];

// Normaliza cargo para Title Case somente se estiver permitido
function normalizarCargo(cargo) {
    if (!cargo) return '';
    const valor = cargo.toString().trim().toLowerCase();
    const encontrado = cargosPermitidos.find(
        permitido => permitido.toLowerCase() === valor
    );
    return encontrado || '';
}
const userController = {
    // GET /users
    getAllUsers: async (req, res) => {
        try {
            // .lean() converte os documentos para objetos JS simples (mais leve)
            const users = await User.find().lean();
            res.render('usersList', { usuarios: users });
        } catch (error) {
            console.error('Erro em getAllUsers:', error);
            res.status(500).send('Erro ao buscar usuários: ' + error.message);
        }
    },

    // GET /users/new
    getNewUserForm: (req, res) => res.render('formUsuario', { query: req.query, cargosPermitidos }),

    // POST /users
    createNewUser: async (req, res) => {
        try {
            // Desestrutura os campos do formulário (nomes usados na view)
            let {
                nome_usuario: nome,
                email_usuario: email,
                cargo_usuario: cargo,
                senha_usuario: senha
            } = req.body;

            // Normaliza email para evitar duplicidade por case/espacos
            if (email) email = email.toLowerCase().trim();

            // validação mínima
            if (!email || !senha || !nome) {
                return res.redirect('/users/new?erro=falta_email_ou_senha');
            }

            // hashing (bcrypt)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            // Role: dono pode escolher; funcionario e público criam sempre comprador
            let roleToSet = 'comprador';
            if (req.session && req.session.userRole === 'dono' && req.body.role) {
                const allowed = ['dono','funcionario','comprador'];
                if (allowed.includes(req.body.role)) roleToSet = req.body.role;
            }

            // Cargo: apenas funcionários precisam ter cargo permitido
            const cargoNormalizado = normalizarCargo(cargo);
            if (roleToSet === 'funcionario' && !cargoNormalizado) {
                return res.redirect('/users/new?erro=cargo_invalido');
            }
            const createdUser = await User.create({
                nome,
                email,
                cargo: cargoNormalizado,
                password: hashedPassword,
                role: roleToSet
            });

            // log
            console.log(`[${new Date().toISOString()}] Novo usuário criado: email=${email} id=${createdUser._id}`);

            // Após cadastro, manda para o login (fluxo comum)
            return res.redirect('/login');
        } catch (error) {
            console.error('Erro em createNewUser:', error);
            // Tratamento simples para chave única (email já cadastrado)
            if (error && error.code === 11000) {
                return res.redirect('/users/new?erro=email_ja_cadastrado');
            }
            return res.status(500).send('Erro ao criar usuário: ' + error.message);
        }
    },

    

    // GET /perfil
    getPerfil: (req, res) => {
        const nomeDoUsuario = req.session.nome;
        if (nomeDoUsuario) return res.render('perfil', { nome: nomeDoUsuario });
        return res.redirect('/login');
    },


    // GET /users/:id/edit
    getEditUserForm: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('ID inválido');
            const user = await User.findById(id).lean();
            if (!user) return res.status(404).send('Usuário não encontrado');
            res.render('editUsuario', { user, cargosPermitidos });
        } catch (error) {
            console.error('Erro em getEditUserForm:', error);
            res.status(500).send('Erro ao carregar formulário de edição');
        }
    },

    // POST /users/:id/update
    updateUser: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('ID inválido');

            const userAtual = await User.findById(id);
            if (!userAtual) return res.status(404).send('Usuário não encontrado');

            const dadosAtualizados = {
                nome: req.body.nome_usuario
            };

            // Só dono pode alterar role
            let roleEfetiva = userAtual.role;
            if (req.session && req.session.userRole === 'dono' && req.body.role) {
                const allowed = ['dono','funcionario','comprador'];
                if (allowed.includes(req.body.role)) roleEfetiva = req.body.role;
            }

            // Cargo: obrigatório e validado apenas para funcionários
            const cargoNormalizado = normalizarCargo(req.body.cargo_usuario);
            if (roleEfetiva === 'funcionario' && !cargoNormalizado) {
                return res.redirect(`/users/${id}/edit?erro=cargo_invalido`);
            }

            dadosAtualizados.role = roleEfetiva;
            dadosAtualizados.cargo = cargoNormalizado;

            await User.findByIdAndUpdate(id, dadosAtualizados);
            res.redirect('/users');
        } catch (error) {
            console.error('Erro em updateUser:', error);
            res.status(500).send('Erro ao atualizar usuário');
        }
    },

    // POST /users/:id/delete
    deleteUser: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('ID inválido');
            await User.findByIdAndDelete(id);
            res.redirect('/users');
        } catch (error) {
            console.error('Erro em deleteUser:', error);
            res.status(500).send('Erro ao deletar usuário');
        }
    }
};

module.exports = userController;