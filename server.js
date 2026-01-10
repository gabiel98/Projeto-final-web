// server.js
// --------------------------------
// Express + MongoDB + React (SPA) + API JSON

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3030;

/* =========================
   SEGURANÇA
========================= */
app.use(helmet());

/* =========================
   BODY PARSER
========================= */
app.use(express.urlencoded({ extended: true })); // para forms antigos
app.use(express.json()); // PARA API JSON DO REACT (ESSENCIAL)

/* =========================
   ARQUIVOS ESTÁTICOS
========================= */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

/* =========================
   SESSÃO
========================= */
const serverStartTime = Date.now();

app.use(session({
  secret: process.env.SESSION_SECRET || 'chave_super_secreta',
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24 * 30
  }),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 dias
  }
}));

/* Invalida sessões antigas ao reiniciar o servidor */
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    if (!req.session.serverStart || req.session.serverStart < serverStartTime) {
      return req.session.destroy(() => {
        res.clearCookie('connect.sid');
        req.sessionInvalidated = true;
        next();
      });
    }
  }
  next();
});

/* =========================
   CSRF (IGNORA API)
========================= */
const csrfProtection = csurf();

function csrfUnlessExcluded(req, res, next) {
  if (req.sessionInvalidated) return next();
  if (req.path.startsWith('/api')) return next(); // IGNORA CSRF PARA API JSON
  return csrfProtection(req, res, next);
}

app.use(csrfUnlessExcluded);

/* =========================
   CONTROLLERS
========================= */
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const cartController = require('./controllers/cartController');
const isAuth = require('./middleware/auth');
const { isAdmin, canManageProducts } = require('./middleware/roles');

/* =========================
   ROTAS API JSON (NOVAS)
========================= */

// Auth
app.post('/api/login', rateLimit({
  windowMs: 60 * 1000,
  max: 5
}), authController.login);
app.post('/api/logout', authController.logout);

// Perfil
app.get('/api/me', isAuth, (req, res) => {
  res.json({
    nome: req.session.userName,
    role: req.session.userRole,
    cargo: req.session.userCargo
  });
});

// Carrinho
app.get('/api/cart', cartController.view);
app.post('/api/cart/add', cartController.add);
app.post('/api/cart/remove', cartController.remove);

// Produtos
app.get('/api/products', productController.list);
app.post('/api/products', canManageProducts, productController.upload.single('imagem'), productController.create);
app.put('/api/products/:id', canManageProducts, productController.upload.single('imagem'), productController.update);
app.delete('/api/products/:id', canManageProducts, productController.remove);

// Usuários
app.get('/api/users', isAdmin, userController.getAllUsers);
app.post('/api/users', isAdmin, userController.createNewUser);
app.put('/api/users/:id', isAdmin, userController.updateUser);
app.delete('/api/users/:id', isAdmin, userController.deleteUser);

/* =========================
   FALLBACK PARA REACT SPA
========================= */
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});
/* =========================
   MONGODB
========================= */
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI não definido');
  process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Erro MongoDB:', err.message);
    process.exit(1);
  });
