import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/formUsuario.css'

function FormUsuario() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome_usuario: '',
    email_usuario: '',
    senha_usuario: '',
    cargo_usuario: '',
    role: 'comprador'
  })

  const [cargosPermitidos, setCargosPermitidos] = useState([])
  const [userRole, setUserRole] = useState('')
  const [erro, setErro] = useState('')

  // Buscar dados do user logado + lista de cargos
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3030/api/me', { credentials: 'include' }),
      fetch('http://localhost:3030/api/users/cargos', { credentials: 'include' })
    ])
      .then(async ([meRes, cargosRes]) => {
        if (meRes.ok) {
          const me = await meRes.json()
          setUserRole(me.role)
        }

        const cargos = await cargosRes.json()
        setCargosPermitidos(cargos)
      })
      .catch(() => setErro('Erro ao carregar dados'))
  }, [])

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    fetch('http://localhost:3030/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(form)
    })
      .then(async res => {
        if (res.ok) {
          navigate('/users')
          return
        }
        const err = await res.json()
        return Promise.reject(err)
      })
      .catch(err => {
        if (err.erro === 'Preencha nome, email e senha') {
          setErro('Preencha nome, email e senha.')
        } else if (err.erro === 'Email já cadastrado') {
          setErro('Este email já está cadastrado.')
        } else if (err.erro === 'Cargo inválido') {
          setErro('Escolha um cargo válido para funcionários.')
        } else {
          setErro('Erro ao criar usuário.')
        }
      })
  }

  return (
    <>
      <Header />

      <main className="form-container">
        <h1 className="form-title">Adicionar Novo Usuário</h1>

        <form className="form-card" onSubmit={handleSubmit}>
          {erro && <p className="error-msg">{erro}</p>}

          <div className="form-group">
            <label>Nome do Usuário *</label>
            <input
              type="text"
              name="nome_usuario"
              value={form.nome_usuario}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email_usuario"
              value={form.email_usuario}
              onChange={handleChange}
              placeholder="Digite o email"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha *</label>
            <input
              type="password"
              name="senha_usuario"
              value={form.senha_usuario}
              onChange={handleChange}
              placeholder="Digite uma senha segura"
              required
            />
          </div>

          {userRole === 'dono' && (
            <>
              <div className="form-group">
                <label>Permissão (Role)</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="comprador">Comprador</option>
                  <option value="funcionario">Funcionário</option>
                  <option value="dono">Dono</option>
                </select>
              </div>

              {form.role === 'funcionario' && (
                <div className="form-group">
                  <label>Cargo (para funcionários)</label>
                  <select
                    name="cargo_usuario"
                    value={form.cargo_usuario}
                    onChange={handleChange}
                  >
                    <option value="">Selecione o cargo</option>
                    {cargosPermitidos.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Adicionar Usuário
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

export default FormUsuario
