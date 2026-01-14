import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/produtos.css'

function Shop() {
  const [produtos, setProdutos] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [tipos, setTipos] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    // Buscar produtos
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProdutos(data))

    // Buscar tipos para o filtro
    fetch('/api/products/tipos')
      .then(res => res.json())
      .then(data => setTipos(data))
      .catch(() => setTipos([]))

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

  function showNotification(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function handleAddToCart(productId) {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId }),
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) {
          showNotification('Produto adicionado ao carrinho com sucesso!', 'success')
        } else {
          showNotification('Erro ao adicionar produto ao carrinho', 'error')
        }
      })
      .catch(() => {
        showNotification('Erro ao adicionar produto ao carrinho', 'error')
      })
  }

  const filteredProducts = selectedTypes.length > 0
    ? produtos.filter(p => selectedTypes.includes(p.tipo))
    : produtos

  function handleTypeChange(tipo) {
    if (selectedTypes.includes(tipo)) {
      setSelectedTypes(selectedTypes.filter(t => t !== tipo))
    } else {
      setSelectedTypes([...selectedTypes, tipo])
    }
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
        <h1 className="products-title"><span className="pokeshop">PokeShop</span> - Produtos</h1>
        
        <div className="products-layout">
          <aside className="products-sidebar">
            <h3>Filtrar por tipo:</h3>
            <div className="filter-checkboxes">
              {tipos.map(tipo => (
                <label key={tipo} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(tipo)}
                    onChange={() => handleTypeChange(tipo)}
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="products-grid">
            {filteredProducts.map(p => (
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

                <Link
                  to={`/products/${p._id}`}
                  className="btn-secondary"
                >
                  Detalhes
                </Link>

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
        </div>

        {(userRole === 'dono' || userRole === 'funcionario') && (
          <div className="add-product">
            <Link to="/products/new" className="btn-add">
              Adicionar novo produto
            </Link>
          </div>
        )}

        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

      </main>

      <Footer />
    </>
  )
}

export default Shop
