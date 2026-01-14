# Projeto Final (Loja Pokemon)

Projeto Final para a disciplina Arquitetura e Tecnologias de Sistemas WEB. 
Alunos: Gilberto Alexsandro Almeida Pessoa; Gabriel Peixoto Menezes da Costa

Este é um projeto demonstrativo em Node.js usando Express, React.js e MongoDB (Mongoose). O objetivo é um CRUD de usuários e produtos com cadastro, login, sessão e proteção de rotas.

## Tecnologias Obrigatórias
- **Node.js / Express**: servidor backend e API REST
- **React.js + Vite**: frontend SPA (Single Page Application)
- **MongoDB / Mongoose**: persistência de dados
- **express-session + connect-mongo**: gerenciamento de sessões persistentes
- **bcryptjs**: hashing de senhas
- **helmet**: segurança de HTTP headers
- **csurf**: proteção contra CSRF
- **express-rate-limit**: limitação de requisições (força bruta)
- **multer**: upload de arquivos (imagens de produtos)

**Estrutura principal**
- `server.js` - ponto de entrada do backend, configurações de sessão e rotas API
- `models/` - esquemas Mongoose (User, Product)
- `controllers/` - lógica da aplicação (`userController.js`, `authController.js`, `productController.js`)
- `middleware/` - middlewares de autenticação e autorização
- `public/uploads/` - armazenamento de imagens de produtos
- `client/` - aplicação React.js com Vite
  - `client/src/` - componentes React e lógica do frontend
  - `client/src/pages/` - páginas React (home, login, perfil, produtos, usuários)
  - `client/src/components/` - componentes reutilizáveis (Header, Footer)
  - `client/src/services/` - API service para comunicação com backend
  - `client/src/styles/` - arquivos CSS
  - `client/dist/` - build de produção (gerado após `npm run build`)

## Sistema de Permissões
O projeto implementa três níveis de acesso:
- **Comprador** (`comprador`): usuário padrão, pode visualizar produtos e adicionar ao carrinho
- **Funcionário** (`funcionario`): pode gerenciar produtos (CRUD completo)
  - Cargos permitidos: Gerente, Repositor, Atendente
- **Dono** (`dono`): acesso total, pode gerenciar usuários e produtos

## Pré-requisitos
- Node.js (recomenda-se v16+)
- MongoDB rodando localmente ou uma URI do Atlas

Recomendações de segurança (instalações adicionais):
- `helmet` — para hardening de HTTP headers
- `express-rate-limit` — já usado para limitar tentativas de login
- `dotenv` — para carregar variáveis de ambiente (se ainda não estiver instalado)

## Instalação

### 1. Instalar dependências do Backend
Abra um terminal na pasta raiz do projeto e instale as dependências do servidor:

```powershell
npm install
```

### 2. Instalar dependências do Frontend (React)
Navegue até a pasta `client` e instale as dependências do React:

```powershell
cd client
npm install
```

### 3. Fazer o build do React
**IMPORTANTE**: Antes de iniciar o servidor backend, você precisa gerar o build de produção do React. Ainda dentro da pasta `client`, execute:

```powershell
npm run build
```

Este comando criará a pasta `client/dist/` com os arquivos otimizados do React. O servidor Express irá servir esses arquivos estáticos.

### 4. Voltar para a pasta raiz
```powershell
cd ..
```

### 5. Configurar variáveis de ambiente
Configure o arquivo `.env` na raiz do projeto com as variáveis necessárias. Exemplo:

```
MONGODB_URI=mongodb://localhost:27017/pokemon-data-base
PORT=3030
SESSION_SECRET=sua_senha_aqui

```

Observação: Se for usar MongoDB Atlas, substitua `MONGODB_URI` pela sua string de conexão.

## Como rodar

### 1. Certifique-se que o MongoDB está ativo (se local):

```powershell
# Em uma instalação padrão do MongoDB no Windows, iniciar o serviço (PowerShell como administrador):
net start MongoDB
# Ou execute o servidor mongod se estiver usando a instalação manual:
mongod --dbpath "C:\caminho\para\dados"
```

### 2. Execute o servidor Node:

```powershell
node server.js
```

O servidor iniciará na porta definida em `PORT` (padrão no `.env` é `3030`). Acesse `http://localhost:3030`.

## Desenvolvimento React (modo dev)

Se você quiser desenvolver o frontend React com hot-reload, você pode rodar o servidor de desenvolvimento do Vite em paralelo:

1. Em um terminal, rode o backend:
```powershell
node server.js
## Rotas principais da API

### Autenticação
- `POST /api/login` - autenticação (cria sessão)
- `POST /api/logout` - finaliza sessão
- `GET /api/me` - retorna dados do usuário autenticado

### Usuários (protegidas, apenas para dono)
- `GET /api/users` - lista todos os usuários
- `GET /api/users/cargos` - retorna lista de cargos permitidos
- `GET /api/users/:id` - retorna dados de um usuário
- `POST /api/users` - cria novo usuário
- `PUT /api/users/:id` - atualiza usuário
- `DELETE /api/users/:id` - exclui usuário

### Produtos
- `GET /api/products` - lista todos os produtos
- `GET /api/products/tipos` - retorna tipos de produtos disponíveis
- `GET /api/products/:id` - retorna dados de um produto
- `POST /api/products` - cria novo produto (com upload de imagem)
- `PUT /api/products/:id` - atualiza produto (com upload opcional de imagem)
- `DELETE /api/products/:id` - exclui produto e sua imagem

### Frontend (React SPA)
- `GET /` - aplicação React (todas as rotas são gerenciadas pelo React Router)
- Rotas do React: `/`, `/login`, `/perfil`, `/users`, `/users/new`, `/users/:id/edit`, `/inventory`, `/products/new`, `/products/:id/edit`, `/cart`
- `GET /login` - formulário de login
## Autenticação e Sessões
- Ao criar um usuário, a senha é armazenada como hash usando `bcryptjs`.
- O login compara a senha enviada com o hash e, se válido, cria sessão com `userId`, `userName`, `userRole` e `userCargo`.
- As sessões são persistidas no MongoDB usando `connect-mongo`, com TTL de 30 dias.
- O servidor invalida automaticamente sessões antigas ao reiniciar (via `serverStartTime`).
- O middleware `isAuth` (em `middleware/auth.js`) protege rotas que exigem autenticação.
- O middleware `isAdmin` protege rotas que exigem permissão de dono.

## Funcionalidades Implementadas

### Gerenciamento de Produtos
- CRUD completo de produtos (criar, ler, atualizar, deletar)
- Upload de imagens com multer (limite de 5MB, apenas imagens)
- Exclusão automática de imagens antigas ao atualizar ou remover produto
- Campos: título, descrição, preço, estoque, tipo, imagem
- Tipos de produtos: Carta, Acessório, Brinquedo, Roupas, Outro

### Gerenciamento de Usuários
- CRUD completo de usuários (apenas para dono)
- Sistema de roles: comprador, funcionario, dono
- Validação de cargos para funcionários (Gerente, Repositor, Atendente)
- Hash de senhas com bcryptjs
- Normalização de email (lowercase e trim)

### Segurança
- Rate limiting no login (5 tentativas por minuto)
- Proteção CSRF em rotas POST (exceto APIs)
- Helmet para hardening de headers HTTP
- Cookies seguros (httpOnly, sameSite)
- Validação de ObjectId do MongoDB
- Sessões persistentes com regeneração no login
- `POST /users` - cria novo usuário (hash de senha)
- `GET /users/:id/edit` - formulário de edição (protegida)
- `POST /users/:id/update` - atualiza usuário (protegida)
- `POST /users/:id/delete` - exclui usuário (protegida)
- `GET /perfil` - página de perfil do usuário autenticado (protegida)

Observação: rotas que alteram dados usam o padrão POST para compatibilidade com formulários HTML.

## Autenticação e Sessões
- Ao criar um usuário, a senha é armazenada como hash usando `bcryptjs`.
- O login compara a senha enviada com o hash e, se válido, cria `req.session.userId` e `req.session.nome`.
- O middleware `isAuth` (em `middleware/auth.js`) protege rotas que exigem autenticação.

## Segurança — Proteção contra SQL Injection (SQLi) e XSS

- **Proteção contra SQLi (confirmação):** este projeto usa **Mongoose** para todas as operações de banco (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`, etc.). Mongoose constrói consultas parametrizadas e não monta comandos SQL/MongoDB por concatenação de strings, então entradas do usuário são tratadas como parâmetros — isso previne os ataques clássicos de SQL Injection.

  - Verificação: o arquivo `controllers/userController.js` foi revisado e **não** contém concatenação manual de strings para formar consultas ao banco. Todas as operações usam métodos do Mongoose com parâmetros separados (por exemplo, `User.findById(id)`, `User.create({...})`, `User.find()`), portanto não há vetores óbvios de injeção por concatenação de queries.

  - Observação importante: evitar o uso de APIs que executam código ou consultas cru (ex.: `Model.collection.execCommand`, `$where` com strings, `eval`-like constructs) sem validação; essas rotas podem reintroduzir vetores de injeção se usadas incorretamente.

- **Proteção contra XSS (recomendações):** Cross-Site Scripting é uma classe diferente de ataque (inserção de scripts no HTML). Boas práticas para reduzir XSS:
  - Nas views EJS, use `\<%= ... %\>` (escape automático) ao exibir dados do usuário. Evite `\<%- ... %\>` que injeta HTML sem escapar, a menos que o conteúdo tenha sido devidamente sanitizado.
  - Sanitize inputs quando for necessário armazenar ou renderizar HTML (bibliotecas como `sanitize-html` ou validação no servidor com `express-validator`).
  - Considere Content Security Policy (CSP) em produção para mitigar execução de scripts injetados.

Essas medidas combinadas reduzem significativamente o risco de ataques SQLi e XSS no escopo deste projeto.

Verificação das Views (XSS):

- Foi verificadas todas as views em `views/` (`formUsuario.ejs`, `usersList.ejs`, `login.ejs`, `editUsuario.ejs`, `perfil.ejs`) e confirmei que **não** há uso de `\<%- ... %\>`. As variáveis de usuário são renderizadas com `\<%= ... %\>` (escape automático do EJS), portanto o output está sendo devidamente escapado por padrão.

  - Arquivos verificados: `formUsuario.ejs`, `usersList.ejs`, `login.ejs`, `editUsuario.ejs`, `perfil.ejs`.

Se desejar, posso automatizar a substituição de qualquer ocorrência de `\<%-` no projeto por `\<%=` ou sanitizar casos específicos, mas neste momento não há ocorrências que precisem ser alteradas.

## Proteção contra Força Bruta (Rate Limiting)

- Para proteger a rota de login contra ataques de força bruta, adicionamos suporte para aplicar um rate limiter no endpoint `POST /login`.
- Dependência necessária: `express-rate-limit`. Instale com:

```powershell
npm install express-rate-limit
```

- Configuração sugerida (já aplicada em `server.js`): janela de 1 minuto e máximo de 5 tentativas — a 6ª tentativa no mesmo minuto recebe HTTP `429` com a mensagem: `Muitas tentativas de login. Tente novamente em 1 minuto.`

## Testes manuais recomendados
1. **Registro e Login**
   - Criar um usuário em `/users/new` (via dono)
   - Fazer login em `/login`
   - Verificar redirecionamento e dados da sessão

2. **Produtos**
   - Criar produto em `/products/new` com imagem
   - Editar produto e trocar imagem (verificar exclusão da antiga)
   - Excluir produto (verificar exclusão da imagem)
   - Verificar listagem na home (`/`)

3. **Usuários (como dono)**
   - Acessar `/users` e visualizar lista
   - Criar novo usuário com role funcionario
   - Editar usuário existente
   - Excluir usuário

4. **Permissões**
   - Login como comprador: verificar que não vê opções de gerenciamento
   - Login como funcionario: verificar acesso ao inventário, mas não a usuários
   - Login como dono: verificar acesso total

5. **Segurança**
   - Testar rate limiting (6 tentativas de login em 1 minuto)
   - Verificar proteção CSRF (tentar POST sem token)
   - Verificar logout e invalidação de sessão

## Credenciais Padrão
Após popular o banco, use estas credenciais para testar:
- **Email**: admin@pokeshop.com
- **Senha**: admin123
- **Role**: dono (acesso total)alhost:3030/login' -Method POST -Body @{ email='invalido@example.com'; senha='senhaerrada' } -UseBasicParsing -ErrorAction SilentlyContinue; Write-Host "Tentativa $($i+1) enviada" }
```

Ou com `curl` (Linux/macOS / Windows com curl instalado):

```bash
for i in 1 2 3 4 5 6; do curl -i -X POST -d "email=invalido@example.com&senha=senhaerrada" http://localhost:3030/login; echo "\n-- tentativa $i --\n"; done
```

Na 6ª requisição dentro de 60 segundos você deverá receber `HTTP/1.1 429` com a mensagem configurada.

## Proteção contra CSRF (Cross-Site Request Forgery)

- Implementamos o middleware `csurf` para proteger rotas POST contra CSRF. O token é gerado por sessão e disponibilizado nas views em `csrfToken`.
- Observação: por requisito, `POST /login` ficou como exceção (o middleware CSRF não é aplicado a esse endpoint). Todas as outras rotas POST exigem o campo oculto `_csrf` em formulários.

Como instalar a dependência:

```powershell
npm install csurf
```

Exemplo de campo oculto no formulário EJS:

```html
<input type="hidden" name="_csrf" value="<%= csrfToken %>" />
```

Teste rápido: tente submeter um formulário POST sem o campo `_csrf` — o servidor retornará erro 403.

## Logs úteis
- Há logs no servidor para eventos importantes:
  - Criação de usuário: imprime timestamp, email e id no terminal.
  - Login bem-sucedido: imprime timestamp, email, id e IP.

## Testes manuais recomendados
- Registrar um usuário em `GET /users/new` → `POST /users`.
- Fazer login em `GET /login` → `POST /login`.
- Acessar `GET /users` e `GET /perfil` (deverão estar acessíveis após login).
- Editar e excluir usuários para validar comportamento de CRUD.

## Vulnerabilidades mitigadas (lista e localizações)

Abaixo há um mapa objetivo das vulnerabilidades que foram mitigadas no projeto e em quais arquivos/trechos essas defesas foram aplicadas:

- **SQL Injection (SQLi):** mitigado pelo uso de Mongoose em `models/User.js` e nos controllers (`controllers/userController.js`, `controllers/authController.js`) — todas as operações ao banco usam métodos parametrizados (`find`, `findOne`, `create`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`).

- **Cross‑Site Scripting (XSS):** mitigado nas views usando escaping do EJS:
  - `views/usersList.ejs` — exibição de `user.nome` e `user.cargo` com `<%= ... %>` (escape automático).
  - `views/formUsuario.ejs`, `views/login.ejs`, `views/editUsuario.ejs`, `views/perfil.ejs` — todas usam `<%= ... %>` para saída de dados do usuário (sem uso inseguro de `<%- ... %>`).

- **Cross‑Site Request Forgery (CSRF):** mitigado em `server.js` com `csurf`; token `_csrf` exposto via `res.locals.csrfToken` e incluído como campo oculto nos formulários em `views/*` (ex.: `formUsuario.ejs`, `editUsuario.ejs`, `usersList.ejs`, `perfil.ejs`).

- **Força Bruta (Rate Limiting):** mitigado em `server.js` aplicando `express-rate-limit` na rota `POST /login` (limite: 5 tentativas por minuto; 6ª tentativa retorna 429).

- **Hardening de HTTP headers:** `server.js` — `helmet()` ativado para aplicar cabeçalhos de segurança (CSP, X-Frame-Options, X-XSS-Protection, etc.).

- **Sessões e cookies seguros:** `server.js` — cookie de sessão configurado com `httpOnly: true`, `sameSite: 'lax'` e `secure` dependente de `NODE_ENV=production`.

- **Proteção de credenciais (variáveis de ambiente):** `.env` e `.env.example` — `MONGODB_URI` e `SESSION_SECRET` movidos para variáveis de ambiente (evitar hardcode de segredos).

- **Hash de senhas:** `controllers/userController.js` — uso de `bcryptjs` para gerar hash antes de salvar senha (campo `password`).

- **Validação de IDs (ObjectId):** `controllers/userController.js` — validação com `mongoose.Types.ObjectId.isValid(id)` em endpoints que usam `:id` (`getEditUserForm`, `updateUser`, `deleteUser`).

- **Normalização de e‑mail:** `controllers/userController.js` e `controllers/authController.js` — `email = email.toLowerCase().trim()` antes de salvar/buscar para evitar duplicidade e problemas de correspondência por case/spaces.

- **Logout seguro:** `controllers/authController.js` — `res.clearCookie('connect.sid', { path: '/' })` para remover explicitamente o cookie de sessão.

- **Mensagens e logs:** handlers registram erros no servidor (console) e mensagens ao cliente foram mantidas genéricas quando apropriado para evitar vazamento de informações sensíveis.

Arquivo principal do projeto: `server.js`.
