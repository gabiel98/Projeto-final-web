import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import api from '../services/api'
import '../styles/usersList.css'

export default function UsersList() {
  const [usuarios, setUsuarios] = useState([])
  const [isDono, setIsDono] = useState(false)
  const navigate = useNavigate()

  // 🔹 verifica permissão
  useEffect(() => {
    api.get('/api/me')
      .then(res => {
        if (res.role === 'dono') {
          setIsDono(true)
        } else {
          navigate('/login')   // ou navegue para '/'
        }
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  // 🔹 só carrega usuários SE for dono
  useEffect(() => {
    if (!isDono) return
    api.get('/api/users')
      .then(res => setUsuarios(res))
      .catch(() => navigate('/login'))
  }, [isDono, navigate])

  // 🔹 excluir usuário
  const handleDelete = async id => {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return
    
    await api.delete(`/api/users/${id}`)
    setUsuarios(usuarios.filter(u => u._id !== id))
  }

  return (
    <>
      <Header />

      <main className="users-container">
        <h1>Gerenciar Usuários</h1>

        {isDono && (
          <button
            className="btn-primary add-user-btn"
            onClick={() => navigate('/users/new')}
          >
            ➕ Adicionar Novo Usuário
          </button>
        )}

        <ul className="users-list">
          {usuarios.map(user => (
            <li key={user._id} className="user-card">
              <div className="user-info">
                <strong>{user.nome}</strong>
                <span className="user-cargo">
                  {user.cargo || '—'}
                </span>
              </div>

              {isDono && (
                <div className="user-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/users/${user._id}/edit`)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(user._id)}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  )
}
