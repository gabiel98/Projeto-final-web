import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/partials.css'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()   // <- Detecta páginas navegadas

  const [auth, setAuth] = useState({
    isAuthenticated: false,
    userName: '',
    userRole: '',
    userCargo: ''
  })

  // 🚀 Faz o GET toda vez que você navega para outra rota
  useEffect(() => {
    api.get('/api/me')
      .then(res => {
        setAuth({
          isAuthenticated: true,
          userName: res.nome,
          userRole: res.role,
          userCargo: res.cargo
        })
      })
      .catch(() => {
        setAuth({
          isAuthenticated: false,
          userName: '',
          userRole: '',
          userCargo: ''
        })
      })
  }, [location.pathname]) // <--- ESSENCIAL

  function handleLogout() {
    api.post('/api/logout')
      .then(() => {
        setAuth({
          isAuthenticated: false,
          userName: '',
          userRole: '',
          userCargo: ''
        })
        navigate('/login')
      })
  }

  return (
    <header className="header">
      <div className="nav-left">
        <Link to="/" className="logo">
          <img src="/logo/logo.png" alt="PokeShop Logo" className="logo-img" />
        </Link>

        {auth.isAuthenticated && (
          <Link to="/perfil">Perfil</Link>
        )}

        <Link to="/cart">Carrinho</Link>

        {(auth.userRole === 'dono' || auth.userRole === 'funcionario') && (
          <Link to="/inventory">Inventário da loja</Link>
        )}

        {auth.userRole === 'dono' && (
          <Link to="/users">Gerenciar usuários</Link>
        )}
      </div>

      <div className="nav-right">
        {auth.isAuthenticated ? (
          <>
            <span>
              Olá, <strong>{auth.userName}</strong>
              {auth.userCargo && ` (${auth.userCargo})`}
            </span>

            <button className="btn-sair" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-login">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
