import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import api from '../services/api'
import '../styles/productForm.css'

export default function ProductForm() {
  const { id } = useParams() // se existir, estamos editando
  const navigate = useNavigate()

  const [tipos, setTipos] = useState([])
  const [produto, setProduto] = useState({
    nome: '',
    preco: '',
    estoque: 0,
    tipo: '',
    descricao: ''
  })
  const [imagem, setImagem] = useState(null)

  // 🔹 carregar lista de tipos
  useEffect(() => {
    api.get('/api/products/tipos')
      .then(res => setTipos(res))
      .catch(() => alert('Erro ao carregar tipos'))
  }, [])

  // 🔹 carregar produto para edição
  useEffect(() => {
    if (id) {
      api.get(`/api/products/${id}`)
        .then(res => setProduto(res))
        .catch(() => alert('Erro ao carregar produto'))
    }
  }, [id])

  // 🔹 envio do formulário
  const handleSubmit = async e => {
    e.preventDefault()
    const formData = new FormData()

    Object.entries(produto).forEach(([key, value]) => {
      formData.append(key, value)
    })
    if (imagem) formData.append('imagem', imagem)

    try {
      if (id) {
        await api.put(`/api/products/${id}`, formData)
      } else {
        await api.post('/api/products', formData)
      }

      navigate('/inventory')
    } catch (err) {
      alert(err.erro || 'Erro ao salvar produto')
    }
  }

  return (
    <>
      <Header />

      <main className="product-form-container">
        <h1>{id ? 'Editar' : 'Novo'} Produto</h1>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Título do Produto</label>
            <input
              type="text"
              value={produto.nome}
              onChange={e => setProduto({ ...produto, nome: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={produto.preco}
              onChange={e => setProduto({ ...produto, preco: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Estoque</label>
            <input
              type="number"
              value={produto.estoque}
              onChange={e => setProduto({ ...produto, estoque: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Produto</label>
            <select
              value={produto.tipo}
              onChange={e => setProduto({ ...produto, tipo: e.target.value })}
              required
            >
              <option value="">Selecione</option>
              {tipos.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              rows="4"
              value={produto.descricao}
              onChange={e => setProduto({ ...produto, descricao: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Imagem do Produto</label>
            <input type="file" onChange={e => setImagem(e.target.files[0])} />

            {produto.imagem && (
              <div className="image-preview">
                <p>Imagem atual:</p>
                <img src={produto.imagem} alt={produto.nome} />
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Salvar
          </button>
        </form>
      </main>

      <Footer />
    </>
  )
}
