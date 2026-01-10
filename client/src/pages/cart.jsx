import { useEffect, useState } from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/cart.css'

function Cart() {
  const [cart, setCart] = useState([])

  // Buscar carrinho inicial
  useEffect(() => {
    fetch('http://localhost:3030/api/cart', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err))
  }, [])

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

        <a href="/" className="btn-continue">
          Continuar comprando
        </a>
      </main>

      <Footer />
    </>
  )
}

export default Cart
