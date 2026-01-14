import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/home.css'

function Home() {
  const [banners, setBanners] = useState([])
  const [produtos, setProdutos] = useState([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [notification, setNotification] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Buscar banners
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => setBanners(data))
      .catch(() => setBanners([]))

    // Buscar produtos para o carrossel
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProdutos(data.slice(0, 12))) // Limita a 12 produtos
      .catch(() => setProdutos([]))

    // Verificar autenticação
    fetch('/api/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error()
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  // Auto-avançar banner
  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000) // Muda a cada 5 segundos
    return () => clearInterval(interval)
  }, [banners.length])

  function nextBanner() {
    setCurrentBanner(prev => (prev + 1) % banners.length)
  }

  function prevBanner() {
    setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)
  }

  function showNotification(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function handleAddToCart(productId) {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) {
          showNotification('Produto adicionado ao carrinho!', 'success')
        } else {
          showNotification('Erro ao adicionar produto', 'error')
        }
      })
      .catch(() => showNotification('Erro ao adicionar produto', 'error'))
  }

  return (
    <>
      <Header />

      <main className="home-container">
        {/* Banner Carrossel */}
        <section className="banner-section">
          <div className="banner-carousel">
            {banners.length > 0 ? (
              <>
                <div className="banner-slide">
                  <img 
                    src={banners[currentBanner].imagem} 
                    alt={`Banner ${currentBanner + 1}`}
                    className="banner-image"
                  />
                </div>
                
                {banners.length > 1 && (
                  <>
                    <button className="banner-btn banner-prev" onClick={prevBanner}>
                      ‹
                    </button>
                    <button className="banner-btn banner-next" onClick={nextBanner}>
                      ›
                    </button>
                    
                    <div className="banner-dots">
                      {banners.map((_, index) => (
                        <span 
                          key={index}
                          className={`dot ${index === currentBanner ? 'active' : ''}`}
                          onClick={() => setCurrentBanner(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="banner-placeholder">
                <h2 className="pokeshop-font">Bem-vindo à PokeShop!</h2>
                <p>Sua loja de itens Pokémon</p>
              </div>
            )}
          </div>
        </section>

        {/* Carrossel de Produtos */}
        <section className="products-carousel-section">
          <h2 className="section-title">Produtos em Destaque</h2>
          
          <div className="products-carousel">
            {produtos.length > 0 ? (
              produtos.map(p => (
                <div className="carousel-product-card" key={p._id}>
                  {p.imagem && (
                    <img src={p.imagem} alt={p.nome} className="carousel-product-image" />
                  )}
                  
                  <h3 className="carousel-product-name">{p.nome}</h3>
                  
                  <div className="carousel-product-info">
                    <div className="carousel-product-type">
                      Tipo: {p.tipo || 'Outro'}
                    </div>
                    <div className="carousel-product-stock">
                      Estoque: {p.estoque || 0} {p.estoque === 1 ? 'unidade' : 'unidades'}
                    </div>
                  </div>
                  
                  <div className="carousel-product-price">
                    R$ {typeof p.preco === 'number' ? p.preco.toFixed(2) : p.preco}
                  </div>
                  
                  <div className="carousel-product-actions">
                    <Link to={`/products/${p._id}`} className="btn-view">
                      Detalhes
                    </Link>
                    
                    {isAuthenticated && (
                      <button 
                        className="btn-add-cart"
                        onClick={() => handleAddToCart(p._id)}
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-products">Nenhum produto disponível no momento.</p>
            )}
          </div>

          <div className="view-all-products">
            <Link to="/shop" className="btn-view-all">
              Ver todos os produtos
            </Link>
          </div>
        </section>

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

export default Home
