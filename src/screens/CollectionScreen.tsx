import React, { useState, useMemo, useEffect } from 'react'
import { ALL_COINS } from '../data/coins' // Ajuste o caminho conforme seu projeto
import { UserCoin, UserProfile, Coin } from '../types' // Ajuste o caminho dos tipos
import CoinVisual from '../components/CoinVisual' // Ajuste o caminho do CoinVisual
import { CoinDetailModal } from '../components/CoinDetailModal'
import { MONETARY_PLANS } from '../data/constants'


interface CollectionScreenProps {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
  onCoinClick: (coin: Coin) => void
}

export function CollectionScreen({
  userCoins,
  userProfile,
  onCoinClick,
}: CollectionScreenProps) {
  // 1. Abas de estado (Tenho, Buscando, Favoritas)
  const [activeStatusTab, setActiveStatusTab] = useState<'owned' | 'wanted' | 'favorites'>('owned')

  // 2. Países ativos do perfil (se não tiver nenhum, assume Brasil)
  const activeCountries = useMemo(() => {
    if (userProfile?.selectedCountries && userProfile.selectedCountries.length > 0) {
      return userProfile.selectedCountries
    }
    return ['Brasil']
  }, [userProfile])

  // 3. País selecionado para visualizar (padrão é o primeiro da lista)
  const [selectedCountry, setSelectedCountry] = useState<string>(activeCountries[0] || 'Brasil')

  // Garante que se o usuário mudar os países no perfil, o estado do país selecionado se ajusta
  useEffect(() => {
    if (!activeCountries.includes(selectedCountry)) {
      setSelectedCountry(activeCountries[0] || 'Brasil')
    }
  }, [activeCountries, selectedCountry])

  // 4. Filtra as moedas do país selecionado + status (Tenho, Buscando ou Favoritas)
  const displayedCoins = useMemo(() => {
    // Pega primeiro apenas as moedas do país selecionado
    const countryCoins = ALL_COINS.filter(c => c.country === selectedCountry)

    // Aplica o filtro de status/favorito
    return countryCoins.filter(c => {
      const uc = userCoins[c.id]
      if (activeStatusTab === 'owned') return uc?.status === 'owned'
      if (activeStatusTab === 'wanted') return uc?.status === 'wanted'
      if (activeStatusTab === 'favorites') return uc?.favorite === true
      return false
    })
  }, [selectedCountry, activeStatusTab, userCoins])

  // Contadores para o país selecionado
  const countryTotalCoins = ALL_COINS.filter(c => c.country === selectedCountry).length
  const countryOwnedCount = ALL_COINS.filter(c => c.country === selectedCountry && userCoins[c.id]?.status === 'owned').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 16 }}>
      {/* CABEÇALHO */}
      <div>
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
          Minhas Coleções
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
          {countryOwnedCount} de {countryTotalCoins} moedas de {selectedCountry}
        </p>
      </div>

      {/* SELETOR DE COLEÇÃO/PAÍS (CHIPS HORIZONTAIS) */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
        {activeCountries.map(country => {
          const isSelected = country === selectedCountry
          return (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${isSelected ? '#D4AF37' : '#2c2c2e'}`,
                background: isSelected ? 'rgba(212,175,55,0.15)' : '#1c1c1e',
                color: isSelected ? '#D4AF37' : '#8e8e93',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {country}
            </button>
          )
        })}
      </div>

      {/* ABAS DE STATUS (TENHO, BUSCO, FAVORITAS) */}
      <div style={{ display: 'flex', gap: 8, background: '#1c1c1e', padding: 4, borderRadius: 12, border: '1px solid #2c2c2e' }}>
        {(['owned', 'wanted', 'favorites'] as const).map(tabKey => {
          const isActive = activeStatusTab === tabKey
          return (
            <button
              key={tabKey}
              onClick={() => setActiveStatusTab(tabKey)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#2c2c2e' : 'transparent',
                color: isActive ? '#4DA3FF' : '#8e8e93',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tabKey === 'owned' ? 'Tenho' : tabKey === 'wanted' ? 'Buscando' : 'Favoritas'}
            </button>
          )
        })}
      </div>

      {/* LISTA OU MENSAGEM DE VAZIO */}
      {displayedCoins.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            background: '#1c1c1e',
            borderRadius: 16,
            border: '1px solid #2c2c2e',
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
            {activeStatusTab === 'owned' ? '📦' : activeStatusTab === 'wanted' ? '⭐' : '❤️'}
          </span>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
            Nenhuma moeda encontrada
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#8e8e93' }}>
            {activeStatusTab === 'owned'
              ? `Você ainda não marcou nenhuma moeda de ${selectedCountry} como possuída.`
              : activeStatusTab === 'wanted'
              ? `Sua lista de moedas buscadas de ${selectedCountry} está vazia.`
              : `Você não tem moedas favoritas em ${selectedCountry}.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayedCoins.map(coin => {
            const uc = userCoins[coin.id]
            return (
              <button
                key={coin.id}
                onClick={() => onCoinClick(coin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: '#1c1c1e',
                  border: '1px solid #2c2c2e',
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <CoinVisual coin={coin} userStatus={uc?.status ?? null} size={48} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#ffffff' }}>{coin.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8e8e93' }}>
                    {coin.year} · {coin.monetaryPlan}
                  </p>
                </div>
                {uc?.favorite && <span style={{ fontSize: 14 }}>❤️</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CollectionScreen