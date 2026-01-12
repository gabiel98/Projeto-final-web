// server.js
// ----------------
// Entrada da aplicação: configura o Express, conecta ao MongoDB
// (via MONGODB_URI no arquivo `.env`) e registra as rotas.

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
// Segurança de headers HTTP
const helmet = require('helmet');
// Rate limiter para proteger rotas sensíveis (ex.: login)
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const mongoose = require('mongoose');
require('dotenv').config(); // carrega variáveis de ambiente do arquivo .env
const app = express();
const port = process.env.PORT || 3030;

// --- Hardening HTTP headers ---
// Deve ser aplicado antes de rotas e outros middlewares para definir
// cabeçalhos HTTP seguros (Content-Security-Policy, X-Frame-Options, etc.)
app.use(helmet());

// Importa o controller que implementa as ações (GET/POST)
const userController = require('./controllers/userController');
// Controller separado para autenticação (login/logout)
const authController = require('./controllers/authController');
// Importa middleware de autenticação (verifica sessão)
const isAuth = require('./middleware/auth');
const { isAdmin, canManageProducts } = require('./middleware/roles');

// --- Configuração do Express ---
app.set('view engine', 'ejs'); // engine de templates
app.set('views', './views'); // pasta das views

// Servir arquivos estáticos (imagens de produtos e CSS)
app.use('/uploads', express.static('public/uploads'));
app.use('/css', express.static('public/css'));

// Middleware: interpreta bodies de formulários (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
// Middleware: interpreta bodies JSON (para APIs REST)
app.use(express.json());

// --- Sessão ---
// Marca de inicialização do servidor para invalidar sessões antigas
const serverStartTime = Date.now();

// Configura o middleware de sessão antes das rotas para que
// `req.session` esteja disponível em todos os handlers.
app.use(session({
    secret: process.env.SESSION_SECRET || 'minha_chave_secreta_super_dificil',
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 60 * 60 * 24 * 30 // 30 dias em segundos
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true, // renova o vencimento a cada requisição
    cookie: {
        secure: (process.env.NODE_ENV === 'production'),
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 dias em ms
    }
}));

// Middleware: invalida sessões criadas antes do início do servidor
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        if (!req.session.serverStart || req.session.serverStart < serverStartTime) {
            return req.session.destroy((err) => {
                if (err) console.error('Erro ao destruir sessão antiga:', err);
                res.clearCookie('connect.sid', { path: '/' });
                // Marca que a sessão foi invalidada para pular CSRF
                req.sessionInvalidated = true;
                next();
            });
        }
    }
    next();
});

// --- Rotas ---
// Produtos: delegar para controller que usa o DB
const productController = require('./controllers/productController');

// Limite de tentativas de login: 5 tentativas por 1 minuto.
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // número máximo de tentativas permitidas
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`[${new Date().toISOString()}] Bloqueio de login por excesso de tentativas (IP=${req.ip})`);
        return res.status(429).json({ erro: 'Muitas tentativas de login. Tente novamente em 1 minuto.' });
    }
});

// --- API REST para autenticação ---
app.post('/api/login', loginLimiter, authController.login);
app.post('/api/logout', authController.logout);
app.get('/api/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }
    res.json({
        userId: req.session.userId,
        userName: req.session.userName,
        nome: req.session.userName,  // alias para compatibilidade
        userRole: req.session.userRole,
        role: req.session.userRole,   // alias para compatibilidade
        userCargo: req.session.userCargo,
        cargo: req.session.userCargo  // alias para compatibilidade
    });
});

// Rotas antigas EJS (podem ser removidas se não usadas mais)
app.get('/login', (req, res) => {
    // Passamos query para exibir erros como ?erro=senha_incorreta
    res.render('login', { query: req.query });
});

// CSRF protection: usamos tokens para rotas POST, exceto /login e rotas com upload
const csrfProtection = csurf();

// Middleware que aplica CSRF protection exceto para rotas específicas
function csrfUnlessExcluded(req, res, next) {
    // Se sessão foi invalidada, não aplicar CSRF (usuário será redirecionado para login)
    if (req.sessionInvalidated) return next();
    // Excluir: POST /api/login, rotas de API e rotas de produtos com upload (multipart/form-data)
    if (req.path === '/api/login' && req.method === 'POST') return next();
    if (req.path === '/login' && req.method === 'POST') return next();
    if (req.path.startsWith('/api/')) return next(); // Todas as rotas de API sem CSRF
    if (req.path === '/products' && req.method === 'POST') return next();
    if (req.path.match(/^\/products\/[^\/]+\/update$/) && req.method === 'POST') return next();
    return csrfProtection(req, res, next);
}

// Aplicar o middleware CSRF depois da sessão e antes das rotas que precisam
app.use(csrfUnlessExcluded);

// Disponibiliza o token nas views (se presente)
app.use((req, res, next) => {
    try {
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
    } catch (err) {
        // Pode ocorrer quando a rota foi ignorada; apenas define vazio
        res.locals.csrfToken = '';
    }
    // Disponibiliza nome/role/cargo nas views, se houver sessão
    res.locals.userName = req.session ? req.session.userName : null;
    res.locals.userRole = req.session ? req.session.userRole : null;
    res.locals.userCargo = req.session ? req.session.userCargo : null;
    res.locals.isAuthenticated = !!(req.session && req.session.userId);
    next();
});

// --- API REST para produtos ---
app.get('/api/products', productController.list);
app.get('/api/products/tipos', productController.tipos);
app.get('/api/products/:id', productController.getById);
app.post('/api/products', canManageProducts, productController.upload.single('imagem'), productController.create);
app.put('/api/products/:id', canManageProducts, productController.upload.single('imagem'), productController.update);
app.delete('/api/products/:id', canManageProducts, productController.remove);

// Debug opcional de sessão (ativar com DEBUG_SESS=1 no .env)
if (process.env.DEBUG_SESS === '1') {
    app.use((req, res, next) => {
        console.log(`[sess] ${new Date().toISOString()} ${req.method} ${req.originalUrl} sid=${req.sessionID} uid=${req.session && req.session.userId ? req.session.userId : 'anon'}`);
        next();
    });
}

// --- API REST para usuários ---
app.get('/api/users', isAdmin, userController.getAllUsers);
app.get('/api/users/cargos', isAdmin, userController.getCargos);
app.get('/api/users/:id', isAdmin, userController.getById);
app.post('/api/users', userController.createNewUser);
app.put('/api/users/:id', isAdmin, userController.updateUser);
app.delete('/api/users/:id', isAdmin, userController.deleteUser);

// Carrinho (session-based - pode ser migrado para API também)
const cartController = require('./controllers/cartController');
app.get('/api/cart', cartController.view);
app.post('/api/cart/add', cartController.add);
app.post('/api/cart/remove', cartController.remove);
app.post('/api/cart/checkout', cartController.checkout);

// --- Servir React App (SPA) ---
// Serve arquivos estáticos do build do React (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// --- Conexão com o MongoDB ---
const mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
    console.error('MONGODB_URI não está definido em .env (ex.: MONGODB_URI=mongodb://localhost:27017/projeto_mvc)');
    process.exit(1);
}

// Ajustes e tratamento de erros globais (ajuda durante o desenvolvimento)
mongoose.set('strictQuery', false);
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Conecta ao MongoDB e só inicia o servidor quando a conexão estiver pronta
mongoose.connect(mongoUri)
    .then(() => {
        console.log('Conectado ao MongoDB');
        app.listen(port, () => {
            console.log(`Servidor MVC rodando em http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Erro ao conectar no MongoDB:', err.message);
        process.exit(1);
    });




