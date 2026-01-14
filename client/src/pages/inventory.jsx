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

      <main className="inventory-container">
        <div className="inventory-header">
          <div>
            <h1 className="inventory-title">Inventário da Loja</h1>
            <p>Gerencie os produtos da sua loja</p>
          </div>
          <Link to="/products/new" className="btn-new-product">
            + Cadastrar novo produto
          </Link>
        </div>

        {(!produtos || produtos.length === 0) ? (
          <div className="empty-state">
            <p>Nenhum produto cadastrado.</p>
          </div>
        ) : (
          <ul>
            {produtos.map(p => (
              <li key={p._id}>
                <div className="product-item-header">
                  {p.imagem && (
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="product-item-image"
                    />
                  )}
                  
                  <div className="product-item-info">
                    <div className="product-item-name">{p.nome}</div>
                    <div className="product-item-price">
                      R$ {typeof p.preco === 'number' ? p.preco.toFixed(2) : p.preco}
                    </div>
                    <div className="product-item-details">
                      <strong>Tipo:</strong> {p.tipo || 'Outro'} | <strong>Estoque:</strong> {p.estoque || 0} {p.estoque === 1 ? 'unidade' : 'unidades'}
                      <br />
                      {p.descricao}
                    </div>
                  </div>
                </div>
                
                <div className="product-item-actions">
                  <Link to={`/products/${p._id}/edit`}>
                    <button className="btn-edit">Editar</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn-delete"
                  >
                    Excluir
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
