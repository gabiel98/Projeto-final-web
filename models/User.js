const mongoose = require('mongoose');

// Schema do usuário
const userSchema = new mongoose.Schema({
	nome: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	cargo: { type: String },
	// role: controla permissões. admin > manager > customer
	role: { type: String, enum: ['admin','manager','customer'], default: 'customer' },
	password: { type: String, required: true },
	criadoEm: { type: Date, default: Date.now }
});

// Criamos o Model (classe) que encapsula a coleção `users`.
// A convenção do Mongoose é pluralizar o nome ('User' -> 'users').
const User = mongoose.model('User', userSchema);

// Exportamos o model para ser usado nos controllers
module.exports = User;
