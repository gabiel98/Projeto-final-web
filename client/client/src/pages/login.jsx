import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    fetch('http://localhost:3030/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',   // envia cookie da sessão
      body: JSON.stringify({ email, senha })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err))
        }

        // recarregar tela para pegar sessão
        window.location.href = '/'
      })
      .catch(err => {
        setErro(err.erro || 'Email ou senha inválidos')
      })
  }

  return (
    <>
      <Header />

      <main className="auth-container">
        <h1>Login</h1>

        {erro && (
          <p className="error-msg">Erro: {erro}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/users/new">Criar conta</Link>
        </p>
      </main>

      <Footer />
    </>
  )
}

export default Login
