const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    console.log("LOGIN TENTATIVA - Email:", req.body.email);

    let { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ ok: false, erro: 'Dados incompletos' });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ ok: false, erro: 'Email ou senha inválidos' });
    }

    const isMatch = await bcrypt.compare(senha, user.password || '');

    if (!isMatch) {
      return res.status(401).json({ ok: false, erro: 'Email ou senha inválidos' });
    }

    req.session.regenerate(err => {
      if (err) {
        console.error('Erro ao regenerar sessão:', err);
        return res.status(500).json({ erro: 'Erro de sessão' });
      }

      req.session.userId = user._id;
      req.session.userName = user.nome;
      req.session.userRole = user.role || 'cliente';
      req.session.userCargo = user.cargo || '';
      req.session.serverStart = Date.now();

      console.log(`Login OK para ${user.email}`);

      req.session.save(() => res.json({ ok: true }));
    });

  } catch (err) {
    console.error('Erro em authController.login:', err);
    return res.status(500).json({ erro: 'Erro no login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return res.status(500).json({ erro: 'Erro ao sair' });
    }

    res.clearCookie('connect.sid', { path: '/' });
    res.json({ ok: true });
  });
};
