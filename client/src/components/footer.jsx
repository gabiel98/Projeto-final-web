import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/partials.css'

export default function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    api.get('/api/me', { withCredentials: true })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  return (
    <footer className="footer">
      <div className="footer-container">

        <p className="footer-copy">
          © 2025 PokeShop. Todos os direitos reservados.
        </p>

        <p className="footer-links">
          Loja online de produtos Pokémon |{' '}
          <Link to="/">Home</Link> |{' '}
          <Link to="/cart">Carrinho</Link>
          {isAuthenticated && (
            <>
              {' '}| <Link to="/perfil">Perfil</Link>
            </>
          )}
        </p>

      </div>
    </footer>
  )
}
