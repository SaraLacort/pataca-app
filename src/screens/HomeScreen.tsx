import React, { useMemo } from 'react'
import { ALL_COINS } from '../data/coins' // Ajuste o caminho se sua lista de moedas ficar em outro lugar
import { UserCoin, UserProfile, Tab, Coin } from '../types' // Ajuste o caminho das suas interfaces/tipos
import { CoinDetailModal } from '../components/CoinDetailModal'
import { LEADERBOARD_USERS } from '../data/leaderboard'

interface HomeScreenProps {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
  onTabChange: (tab: Tab) => void
  onCoinClick: (coin: Coin) => void
}

export function HomeScreen({
  userCoins,
  userProfile,
  onTabChange,
  onCoinClick,
}: HomeScreenProps) {
  // 1. Pega os países selecionados no perfil
  const activeCountries =
    userProfile?.selectedCountries && userProfile.selectedCountries.length > 0
      ? userProfile.selectedCountries
      : ['Brasil']

  // 2. Calcula as métricas por país
  const collectionStatsByCountry = useMemo(() => {
    return activeCountries.map(country => {
const countryCoins = ALL_COINS.filter(c => c.country === country)

// Quantidade total física de moedas, incluindo repetidas
const owned = countryCoins.filter(
  c => userCoins[c.id]?.status === 'owned'
).length

const wanted = countryCoins.filter(
  c => userCoins[c.id]?.status === 'wanted'
).length

const total = countryCoins.length

const pct =
  total > 0
    ? Math.round((owned / total) * 100)
    : 0

// Quantidade de tipos diferentes possuídos.
// Usada apenas para calcular a porcentagem da coleção.
const uniqueOwned = countryCoins.filter(
  c => userCoins[c.id]?.status === 'owned'
).length



      return { country, owned, wanted, total, pct }
    })
  }, [activeCountries, userCoins])

  // 3. CALCULA A POSIÇÃO REAL NO RANKING
  const myRank = useMemo(() => {
const myOwnedCount = Object.values(userCoins).filter(
  u => u.status === 'owned'
).length

const myName = userProfile?.name?.trim() || 'Colecionador'

    const mockUsers = [
      { name: 'Carlos Silva', coinsCount: 142 },
      { name: 'Mariana Costa', coinsCount: 118 },
      { name: 'Roberto Alves', coinsCount: 84 },
      { name: 'Fernanda Lima', coinsCount: 62 },
      { name: 'Lucas Mendes', coinsCount: 45 },
      { name: 'Juliana Rocha', coinsCount: 30 },
    ]

    const allList = [
      ...mockUsers,
      { name: myName, coinsCount: myOwnedCount, isMe: true }
    ]

    // Ordena do maior para o menor acervo
    allList.sort((a, b) => b.coinsCount - a.coinsCount)

    const index = allList.findIndex(u => u.isMe)
    return index !== -1 ? index + 1 : '-'
  }, [userCoins, userProfile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 8 }}>
      {/* 2. PRIMEIRO BLOCO: CABEÇALHO LADO A LADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <p style={{ fontSize: 16, color: 'rgb(255, 255, 255)', margin: '0 0 2px' }}>Bem-vindo(a) de volta,</p>
          <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 28, fontWeight: 700, margin: 0, color: '#ffffff' }}>
            {userProfile?.name || 'Colecionador'}
          </h1>
        </div>

        <button
          onClick={() => onTabChange('stats')}
          style={{
            background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)',
            border: '1px solid #D4AF37',
            borderRadius: 20,
            padding: '18px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212,175,55,0.15)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ranking
          </span>
          <span style={{ fontFamily: "'Roboto Slab', serif", fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
            #{myRank}
          </span>
        </button>
      </div>

      {/* 3. SEGUNDO BLOCO: MINHAS COLEÇÕES */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
  <h2
    style={{
      fontFamily: "'Roboto Slab', serif",
      fontSize: 16,
      fontWeight: 600,
      margin: 0,
      color: '#ffffff',
    }}
  >
    Minhas Coleções
  </h2>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        window.innerWidth >= 900
          ? 'repeat(2, minmax(0, 1fr))'
          : '1fr',
      gap: 14,
    }}
  >
    {collectionStatsByCountry.map(item => (
          <div
            key={item.country}
            style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0d1a30 100%)',
              borderRadius: 20,
              padding: 18,
              border: '1px solid rgba(77,163,255,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(77,163,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Coleção {item.country}
                </p>
                <p style={{ margin: '4px 0 0', fontFamily: "'Roboto Slab', serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
                  {item.owned} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>de {item.total} moedas</span>
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(77,163,255,0.15)',
                  borderRadius: 12,
                  padding: '6px 12px',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, fontFamily: "'Roboto Slab', serif", fontSize: 20, fontWeight: 700, color: '#4DA3FF' }}>
                  {item.pct}%
                </p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  completa
                </p>
              </div>
            </div>

            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${item.pct}%`,
                  background: 'linear-gradient(90deg, #4DA3FF, #2080E0)',
                  borderRadius: 4,
                  transition: 'width 0.8s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item.owned} Tenho</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFB300' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item.wanted} buscando</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

export default HomeScreen