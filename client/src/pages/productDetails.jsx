import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/produtos.css'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Produto não encontrado')
        return res.json()
      })
      .then(data => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

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

  if (loading) {
    return (
      <>
        <Header />
        <main className="product-detail-container">
          <p>Carregando produto...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="product-detail-container">
        {product ? (
          <div className="product-detail-card">
            {product.imagem && (
              <img
                src={product.imagem}
                alt={product.nome}
                className="product-detail-image"
              />
            )}

            <div className="product-detail-info">
              <h1>{product.nome}</h1>
              <p className="detail-price">R$ {Number(product.preco).toFixed(2)}</p>
              <p><strong>Tipo:</strong> {product.tipo || 'Outro'}</p>
              <p><strong>Estoque:</strong> {product.estoque || 0} unidades</p>
              <p className="detail-description">{product.descricao || 'Sem descrição'}</p>

              <div className="detail-actions">
                <button
                  className="btn-details-add"
                  onClick={() => handleAddToCart(product._id)}
                >
                  Adicionar ao carrinho
                </button>
                <Link to="/" className="btn-details-back">
                  Voltar
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="cart-empty">Produto não encontrado.</p>
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
