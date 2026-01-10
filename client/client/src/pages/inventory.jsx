import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/inventory.css'

function Inventory() {
  const [produtos, setProdutos] = useState([])

  // Buscar produtos do inventário
  useEffect(() => {
    fetch('http://localhost:3030/api/products', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(err => console.error(err))
  }, [])

  function handleDelete(id) {
    if (!window.confirm('Deseja excluir este produto?')) return

    fetch(`http://localhost:3030/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error()
        setProdutos(prev => prev.filter(p => p._id !== id))
      })
      .catch(() => alert('Erro ao excluir produto'))
  }

  return (
    <>
      <Header />

      <main>
        <h1>Inventário da Loja</h1>
        <p>Aqui você pode cadastrar, editar e excluir itens.</p>

        <p>
          <Link to="/products/new">➕ Cadastrar novo produto</Link>
        </p>

        {(!produtos || produtos.length === 0) ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <ul>
            {produtos.map(p => (
              <li key={p._id}>
                {p.imagem && (
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    style={{
                      maxWidth: '80px',
                      height: 'auto',
                      verticalAlign: 'middle',
                      marginRight: '10px'
                    }}
                  />
                )}

                <strong>{p.nome}</strong> — R$ {
                  typeof p.preco === 'number'
                    ? p.preco.toFixed(2)
                    : p.preco
                }

                <br />

                <small>
                  Tipo: {p.tipo || 'Outro'} | Estoque: {p.estoque || 0} | {p.descricao}
                </small>

                <div style={{ marginTop: '6px' }}>
                  <Link to={`/products/${p._id}/edit`}>
                    <button>✏️ Editar</button>
                  </Link>

                  <button
                    onClick={() => handleDelete(p._id)}
                    style={{ color: 'red', marginLeft: '6px' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </>
  )
}

export default Inventory
