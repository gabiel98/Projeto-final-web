import { useEffect, useState } from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/cart.css'

function Cart() {
  const [cart, setCart] = useState([])
  const [notification, setNotification] = useState(null)

  // Buscar carrinho inicial
  useEffect(() => {
    fetch('http://localhost:3030/api/cart', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err))
  }, [])

  function showNotification(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Remover item
  function handleRemove(index) {
    fetch('http://localhost:3030/api/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ index })
    })
      .then(res => res.json())
      .then(() => {
        // Como o backend não devolve o carrinho, removemos no estado:
        setCart(prev => prev.filter((_, i) => i !== index))
      })
      .catch(console.error)
  }

  // Processar compra
  function handleCheckout() {
    fetch('http://localhost:3030/api/cart/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          showNotification('Compra realizada com sucesso!', 'success')
          setCart([])
        } else {
          showNotification(data.erro || 'Erro ao processar compra', 'error')
        }
      })
      .catch(err => {
        console.error(err)
        showNotification('Erro ao processar compra', 'error')
      })
  }

  return (
    <>
      <Header />

      <main className="cart-container">
        <h1 className="cart-title">Seu Carrinho</h1>

        {!cart || cart.length === 0 ? (
          <p className="cart-empty">Seu carrinho está vazio.</p>
        ) : (
          <ul className="cart-list">
            {cart.map((item, idx) => (
              <li className="cart-item" key={idx}>
                {item.imagem && (
                  <img 
                    src={item.imagem} 
                    alt={item.nome}
                    className="cart-image"
                  />
                )}
                
                <div className="cart-info">
                  <strong>{item.nome}</strong>
                  <span className="cart-price">
                    R$ {Number(item.preco).toFixed(2)}
                  </span>
                </div>

                <button
                  className="btn-remove"
                  onClick={() => handleRemove(idx)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-actions">
          {cart && cart.length > 0 && (
            <button className="btn-checkout" onClick={handleCheckout}>
              Finalizar Compra
            </button>
          )}
          <a href="/" className="btn-continue">
            Continuar comprando
          </a>
        </div>

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

export default Cart
