import React, { useState } from 'react'
import { ALL_COINS } from '../data/coins' // Ajuste o caminho das moedas conforme seu projeto
import { UserCoin, UserProfile } from '../types' // Ajuste o caminho dos tipos
import ExportPage from '../components/ExportPage' // Ajuste o caminho do componente ExportPage


// Pega todos os países únicos de ALL_COINS e cria a lista de coleções
export const ALL_COLLECTIONS = Array.from(
  new Set(ALL_COINS.map(coin => coin.country).filter(Boolean))
)

export function ProfileScreen({
  userCoins,
  userProfile,
  onLogout,
  onEditProfile,
  onUpdateAvatar,
  onExport,
}: ProfileScreenProps) 

export function ProfileScreen({
  userCoins,
  userProfile,
  onLogout,
  onEditProfile,
  onUpdateAvatar,
  onExport,
}: {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
  onLogout: () => void
  onEditProfile: () => void
  onUpdateAvatar: (avatarSrc: string) => void
}) {
  const [showAvatarModal, setShowAvatarModal] = useState(false)

const ownedCount = Object.values(userCoins).reduce((total, userCoin) => {
  if (userCoin.status !== 'owned') {
    return total
  }

  return total + Math.max(1, userCoin.quantity ?? 1)
}, 0)

  const wantedCount = Object.values(userCoins).filter(u => u.status === 'wanted').length
  const activeCollectionsCount = userProfile?.selectedCountries?.length || 1

  const customAvatar = userProfile?.avatar || null
  const initialLetter = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '👤'

  // Converte o objeto userCoins para a lista usada na exportação
const exportList = Object.keys(userCoins).map(id => {
  const coinData = ALL_COINS.find(c => c.id === id)
  const userCoin = userCoins[id]

  return {
    id,
    name: coinData?.name || 'Moeda',
    year: coinData?.year || '',
    monetaryPlan: coinData?.monetaryPlan || '',
    material: coinData?.material || '',
    country: coinData?.country || 'Brasil',

    quantity:
      userCoin.status === 'owned'
        ? Math.max(1, Number(userCoin.quantity) || 1)
        : 0,

    stateOfPreservation:
      userCoin.condition || '-',

    status: userCoin.status,
  }
})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 12px' }}>
          <button
            onClick={() => setShowAvatarModal(false)}
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4DA3FF, #1565C0)',
              border: '2px solid #4DA3FF',
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(77,163,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 36,
              fontWeight: 700,
              fontFamily: "'Roboto Slab', serif",
            }}
          >
            {customAvatar ? (
              <img src={customAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initialLetter
            )}
          </button>
        </div>
        <h2 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 25, fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
          {userProfile?.name || 'Colecionador'}
        </h2>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#8e8e93' }}>
          {userProfile?.email}
        </p>

        {userProfile?.instagram && (
          <a
            href={`https://instagram.com/${userProfile.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              color: '#53243a',
              textDecoration: 'none',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            📷 @{userProfile.instagram}
          </a>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { value: ownedCount, label: 'Tenho' },
          { value: wantedCount, label: 'Buscando' },
          { value: activeCollectionsCount, label: 'Coleções' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: '#1c1c1e',
              borderRadius: 14,
              padding: '14px 8px',
              textAlign: 'center',
              border: '1px solid #2c2c2e',
            }}
          >
            <p style={{ margin: 0, fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, color: '#ffffff' }}>
              {s.value}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8e8e93' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#1c1c1e', borderRadius: 16, border: '1px solid #2c2c2e', overflow: 'hidden' }}>
        {[
          { icon: '👤', label: 'Editar perfil', action: onEditProfile },
          { icon: '📤', label: 'Exportar coleção', action: onExport },
          { icon: '🚪', label: 'Sair da conta', danger: true, action: onLogout },
        ].map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: i < 2 ? '1px solid #2c2c2e' : 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: item.danger ? '#EF5350' : '#ffffff',
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            <span style={{ marginLeft: 'auto', color: '#8e8e93' }}>›</span>
          </button>
        ))}
      </div>

      {/* Modal para Trocar o Avatar */}
      {showAvatarModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            style={{
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 360,
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontFamily: "'Roboto Slab', serif", color: '#fff' }}>
              Escolha seu Avatar
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#8e8e93' }}>Selecione uma imagem</p>

            <button
              type="button"
              onClick={() => {
                onUpdateAvatar('')
                setShowAvatarModal(false)
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 12,
                border: '1px solid #4DA3FF',
                background: 'rgba(77,163,255,0.1)',
                color: '#4DA3FF',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              Usar Avatar Padrão Azul
            </button>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                marginBottom: 20,
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {AVATAR_OPTIONS.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onUpdateAvatar(item.src)
                    setShowAvatarModal(false)
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: customAvatar === item.src ? 'rgba(77,163,255,0.2)' : '#2c2c2e',
                    border: `2px solid ${customAvatar === item.src ? '#4DA3FF' : '#2c2c2e'}`,
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                  }}
                >
                  <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: '#2c2c2e',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}



      <p style={{ textAlign: 'center', fontSize: 11, color: '#8e8e93', margin: 0 }}>
        Pataca v1.0.0
      </p>
    </div>
  )
}

export default ProfileScreen