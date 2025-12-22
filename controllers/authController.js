const User = require('../models/User');
const bcrypt = require('bcryptjs');
exports.login = async (req, res) => {
  try {
    let { email, senha } = req.body;
    // Normaliza email antes da busca
    if (email) email = email.toLowerCase().trim();
    // 1. Buscar usuário pelo email
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/login?erro=usuario');

    // 2. Comparar senha com o Hash
    const isMatch = await bcrypt.compare(senha, user.password || '');
    if (!isMatch) return res.redirect('/login?erro=senha');

    // proteger contra session fixation e garantir persistência antes do redirect
    req.session.regenerate(err => {
      if (err) {
        console.error('Erro ao regenerar sessão:', err);
        return res.status(500).send('Erro de sessão');
      }

      req.session.userId = user._id;
      req.session.userName = user.nome;
      req.session.userRole = user.role || 'comprador';
      req.session.userCargo = user.cargo || '';
      req.session.nome = user.nome;
      req.session.serverStart = Date.now();

      // log
      console.log(`[${new Date().toISOString()}] Login bem-sucedido: email=${user.email} id=${user._id} ip=${req.ip}`);

      req.session.save(() => res.redirect('/perfil'));
    });
  } catch (err) {
    console.error('Erro em authController.login:', err);
    return res.status(500).send('Erro no login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return res.redirect('/perfil');
    }
    // Limpar cookie de sessão explicitamente no path raiz
    res.clearCookie('connect.sid', { path: '/' });
    return res.redirect('/login');
  });
};
