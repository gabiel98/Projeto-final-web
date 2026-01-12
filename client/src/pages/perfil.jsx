import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/perfil.css'

function Perfil() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    fetch('http://localhost:3030/api/me', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(user => {
        setNome(user.nome)
        setUserRole(user.role)
      })
      .catch(() => {
        navigate('/login')
      })
  }, [navigate])

  function handleLogout() {
    fetch('http://localhost:3030/api/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        // força recarregar header/sessão
        window.location.href = '/login'
      })
  }

  return (
    <>
      <Header />

      <main className="profile-container">
        <h1>Meu Perfil</h1>

        <p className="profile-welcome">
          Olá, <strong>{nome}</strong>!
        </p>

        <div className="profile-links">
          <Link to="/cart">Meu carrinho</Link>
          <Link to="/">Voltar à loja</Link>

          {(userRole === 'dono' || userRole === 'funcionario') && (
            <Link to="/inventory">Inventário da loja</Link>
          )}

          {userRole === 'dono' && (
            <Link to="/users">Gerenciar usuários</Link>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="btn-danger logout-form"
        >
          Sair
        </button>
      </main>

      <Footer />
    </>
  )
}

export default Perfil
