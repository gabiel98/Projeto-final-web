import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import '../styles/banners.css'

export default function BannersManagement() {
  const [banners, setBanners] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [ordem, setOrdem] = useState(0)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  function loadBanners() {
    fetch('/api/banners/all', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBanners(data))
      .catch(() => setBanners([]))
  }

  function showNotification(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    // Verificar permissão
    fetch('/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(user => {
        if (user.role !== 'dono' && user.role !== 'funcionario') {
          navigate('/')
          return
        }
        loadBanners()
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0])
  }

  async function handleUpload(e) {
    e.preventDefault()
    
    if (!selectedFile) {
      showNotification('Selecione uma imagem', 'error')
      return
    }

    const formData = new FormData()
    formData.append('imagem', selectedFile)
    formData.append('ordem', ordem)

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        showNotification('Banner adicionado com sucesso!', 'success')
        setSelectedFile(null)
        setOrdem(0)
        document.getElementById('file-input').value = ''
        loadBanners()
      } else {
        showNotification('Erro ao adicionar banner', 'error')
      }
    } catch {
      showNotification('Erro ao adicionar banner', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este banner?')) return

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        showNotification('Banner excluído com sucesso!', 'success')
        loadBanners()
      } else {
        showNotification('Erro ao excluir banner', 'error')
      }
    } catch {
      showNotification('Erro ao excluir banner', 'error')
    }
  }

  async function handleToggleAtivo(id, currentState) {
    try {
      const formData = new FormData()
      formData.append('ativo', !currentState)

      const res = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        showNotification('Status atualizado!', 'success')
        loadBanners()
      } else {
        showNotification('Erro ao atualizar status', 'error')
      }
    } catch {
      showNotification('Erro ao atualizar status', 'error')
    }
  }

  return (
    <>
      <Header />

      <main className="banners-container">
        <h1>Gerenciar Banners</h1>

        <section className="banner-upload-section">
          <h2>Adicionar Novo Banner</h2>
          <form onSubmit={handleUpload} className="banner-form">
            <div className="form-group">
              <label>Imagem do Banner:</label>
              <input 
                id="file-input"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ordem de Exibição:</label>
              <input 
                type="number"
                value={ordem}
                onChange={e => setOrdem(e.target.value)}
                min="0"
              />
            </div>

            <button type="submit" className="btn-primary">
              Adicionar Banner
            </button>
          </form>
        </section>

        <section className="banners-list-section">
          <h2>Banners Cadastrados</h2>
          
          {banners.length > 0 ? (
            <div className="banners-grid">
              {banners.map(banner => (
                <div key={banner._id} className={`banner-card ${!banner.ativo ? 'inactive' : ''}`}>
                  <img src={banner.imagem} alt="Banner" className="banner-preview" />
                  
                  <div className="banner-info">
                    <p><strong>Ordem:</strong> {banner.ordem}</p>
                    <p><strong>Status:</strong> {banner.ativo ? 'Ativo' : 'Inativo'}</p>
                  </div>

                  <div className="banner-actions">
                    <button 
                      className="btn-toggle"
                      onClick={() => handleToggleAtivo(banner._id, banner.ativo)}
                    >
                      {banner.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button 
                      className="btn-danger"
                      onClick={() => handleDelete(banner._id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-banners">Nenhum banner cadastrado.</p>
          )}
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
