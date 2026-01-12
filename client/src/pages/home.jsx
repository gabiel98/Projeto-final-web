import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/produtos.css'

function Home() {
  const [produtos, setProdutos] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    // Buscar produtos
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProdutos(data))

    // Buscar dados do usuário logado
    fetch('/api/me', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(user => {
        setIsAuthenticated(true)
        setUserRole(user.role)
      })
      .catch(() => setIsAuthenticated(false))
  }, [])

  function handleAddToCart(productId) {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId }),
      credentials: 'include'
    })
  }

  function handleDeleteProduct(productId) {
    if (!window.confirm('Deseja excluir este produto?')) return

    fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(() => {
        setProdutos(produtos.filter(p => p._id !== productId))
      })
  }

  return (
    <>
      <Header />

      <main className="products-container">
        <h1 className="products-title">PokeShop - Itens Pokémon</h1>

        <section className="products-grid">
          {produtos.map(p => (
            <div className="product-card" key={p._id}>

              {p.imagem && (
                <img
                  src={p.imagem}
                  alt={p.nome}
                  className="product-image"
                />
              )}

              <h3 className="product-name">{p.nome}</h3>

              <div className="product-price">
                R$ {typeof p.preco === 'number'
                  ? p.preco.toFixed(2)
                  : p.preco}
              </div>

              <p><strong>Tipo:</strong> {p.tipo || 'Outro'}</p>
              <p><strong>Estoque:</strong> {p.estoque || 0} unidades</p>
              <p className="product-description">{p.descricao}</p>

              <div className="product-actions">

                {isAuthenticated && (
                  <button
                    className="btn-primary"
                    onClick={() => handleAddToCart(p._id)}
                  >
                    Adicionar
                  </button>
                )}

                {(userRole === 'dono' || userRole === 'funcionario') && (
                  <>
                    <Link
                      to={`/products/${p._id}/edit`}
                      className="btn-secondary"
                    >
                      Editar
                    </Link>

                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteProduct(p._id)}
                    >
                      Excluir
                    </button>
                  </>
                )}

              </div>
            </div>
          ))}
        </section>

        {(userRole === 'dono' || userRole === 'funcionario') && (
          <div className="add-product">
            <Link to="/products/new" className="btn-add">
              Adicionar novo produto
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </>
  )
}

export default Home
