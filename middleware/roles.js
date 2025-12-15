// middleware/roles.js
// Funções de middleware para verificar permissões por role
function isAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.userRole === 'dono') return next();
  return res.status(403).send('Acesso negado: apenas donos.');
}

function canManageProducts(req, res, next) {
  if (req.session && req.session.userId) {
    const role = req.session.userRole;
    if (role === 'dono' || role === 'funcionario') return next();
  }
  return res.status(403).send('Acesso negado: permissões insuficientes.');
}

module.exports = { isAdmin, canManageProducts };
