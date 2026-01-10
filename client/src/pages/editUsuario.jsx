import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/editUsuario.css'

function EditUsuario() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState({
    nome_usuario: '',
    cargo_usuario: '',
    role: ''
  })

  const [cargosPermitidos, setCargosPermitidos] = useState([])
  const [userRole, setUserRole] = useState('')
  const [erro, setErro] = useState('')

  // Buscar dados do usuário + permissões + cargos
  useEffect(() => {
    async function load() {
      try {
        const [userRes, meRes, cargosRes] = await Promise.all([
          fetch(`http://localhost:3030/api/users/${id}`, { credentials: 'include' }),
          fetch(`http://localhost:3030/api/me`, { credentials: 'include' }),
          fetch(`http://localhost:3030/api/users/cargos`, { credentials: 'include' })
        ])

        if (!userRes.ok) throw new Error()
        const userData = await userRes.json()
        const meData = meRes.ok ? await meRes.json() : {}
        const cargosData = await cargosRes.json()

        setUser({
          nome_usuario: userData.nome || '',
          cargo_usuario: userData.cargo || '',
          role: userData.role || 'comprador'
        })

        setUserRole(meData.role || '')
        setCargosPermitidos(cargosData)

      } catch (err) {
        setErro('Erro ao carregar dados do usuário')
      }
    }

    load()
  }, [id])

  function handleChange(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    fetch(`http://localhost:3030/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(user)
    })
      .then(async res => {
        if (res.ok) {
          navigate('/users')
        } else {
          const err = await res.json()
          throw err
        }
      })
      .catch(err => {
        if (err.erro === 'Cargo inválido') {
          setErro('Escolha um cargo válido para funcionários.')
        } else {
          setErro('Erro ao atualizar usuário.')
        }
      })
  }

  return (
    <>
      <Header />

      <main className="form-container">
        <h1 className="form-title">Editar Usuário</h1>

        <form className="form-card" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome_usuario"
              value={user.nome_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Cargo (apenas para funcionários)</label>
            <select
              name="cargo_usuario"
              value={user.cargo_usuario}
              onChange={handleChange}
            >
              <option value="">
                Selecione (obrigatório para funcionários)
              </option>

              {cargosPermitidos.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {userRole === 'dono' && (
            <div className="form-group">
              <label>Permissão</label>
              <select
                name="role"
                value={user.role}
                onChange={handleChange}
              >
                <option value="comprador">Comprador</option>
                <option value="funcionario">Funcionário</option>
                <option value="dono">Dono</option>
              </select>
            </div>
          )}

          {erro && (
            <p className="form-error">{erro}</p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              💾 Salvar Alterações
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/users')}
            >
              Cancelar
            </button>
          </div>

        </form>
      </main>

      <Footer />
    </>
  )
}

export default EditUsuario
