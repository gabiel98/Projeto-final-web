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

      <h1>Adicionar Usuário</h1>

      <form className="form-addUser" onSubmit={handleSubmit}>
        <div>
          <label>Nome do Usuário:</label>
          <input
            type="text"
            name="nome_usuario"
            value={form.nome_usuario}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email (obrigatório):</label>
          <input
            type="email"
            name="email_usuario"
            value={form.email_usuario}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Senha (obrigatório):</label>
          <input
            type="password"
            name="senha_usuario"
            value={form.senha_usuario}
            onChange={handleChange}
            required
          />
        </div>

        {userRole === 'dono' && (
          <>
            <div>
              <label>Cargo (funcionário somente):</label>
              <select
                name="cargo_usuario"
                value={form.cargo_usuario}
                onChange={handleChange}
              >
                <option value="">
                  Selecione o cargo
                </option>
                {cargosPermitidos.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Permissão:</label>
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
          </>
        )}

        {erro && <p style={{ color: 'red' }}>{erro}</p>}

        <button className="btn-addUser" type="submit">Adicionar Usuário</button>
      </form>

      <p className="back-list">
        <button onClick={() => navigate('/users')}>
          Voltar para lista
        </button>
      </p>

      <Footer />
    </>
  )
}

export default FormUsuario
