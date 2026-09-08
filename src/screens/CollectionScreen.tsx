import React, { useState, useMemo, useEffect } from 'react'
import { ALL_COINS } from '../data/coins'
import { UserCoin, UserProfile, Coin } from '../types'
import CoinVisual from '../components/CoinVisual'
import CoinDetailModal from '../components/CoinDetailModal'
import { MONETARY_PLANS } from '../data/constants'

interface CollectionScreenProps {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
  onCoinClick: (coin: Coin) => void
  onReorderCountries: (countries: string[]) => void
}

export function CollectionScreen({
  userCoins,
  userProfile,
  onCoinClick,
  onReorderCountries,
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
    const [draggedCountryIndex, setDraggedCountryIndex] = useState<number | null>(null)
  const [dragOverCountryIndex, setDragOverCountryIndex] = useState<number | null>(null)

  const handleCountryDrop = (targetIndex: number) => {
    if (
      draggedCountryIndex === null ||
      draggedCountryIndex === targetIndex
    ) {
      setDraggedCountryIndex(null)
      setDragOverCountryIndex(null)
      return
    }

    const reorderedCountries = [...activeCountries]
    const [movedCountry] = reorderedCountries.splice(draggedCountryIndex, 1)

    reorderedCountries.splice(targetIndex, 0, movedCountry)

    onReorderCountries(reorderedCountries)

    setDraggedCountryIndex(null)
    setDragOverCountryIndex(null)
  }

  // Garante que se o usuário mudar os países no perfil, o estado do país selecionado se ajusta
  useEffect(() => {
    if (!activeCountries.includes(selectedCountry)) {
      setSelectedCountry(activeCountries[0] || 'Brasil')
    }
  }, [activeCountries, selectedCountry])

  // 4. Filtra as moedas do país selecionado + status (Tenho, Buscando ou Favoritas)
  const displayedCoins = useMemo(() => {
    const countryCoins = ALL_COINS.filter(c => c.country === selectedCountry)

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
const countryOwnedCount = ALL_COINS
  .filter(c => c.country === selectedCountry)
  .reduce((total, coin) => {
    const userCoin = userCoins[coin.id]

    if (userCoin?.status !== 'owned') {
      return total
    }

    return total + Math.max(1, userCoin.quantity ?? 1)
  }, 0)

  return (
    <div className="web-collection" style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 16 }}>
      {/* CABEÇALHO */}
      <div>
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
          Minhas Coleções
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
          {countryOwnedCount} de {countryTotalCoins} moedas de {selectedCountry}
        </p>
      </div>

{/* SELETOR DE COLEÇÃO/PAÍS - ARRASTAR PARA REORDENAR */}
<div
  style={{
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    WebkitOverflowScrolling: 'touch',
  }}
>
  {activeCountries.map((country, index) => {
    const isSelected = country === selectedCountry
    const isDragging = draggedCountryIndex === index
    const isDragOver = dragOverCountryIndex === index

    return (
      <button
        key={country}
        draggable
        data-country-index={index}
        onClick={() => {
          // Não troca o país enquanto está arrastando
          if (draggedCountryIndex === null) {
            setSelectedCountry(country)
          }
        }}
        onDragStart={e => {
          setDraggedCountryIndex(index)
          e.dataTransfer.effectAllowed = 'move'
        }}
        onDragOver={e => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'

          if (dragOverCountryIndex !== index) {
            setDragOverCountryIndex(index)
          }
        }}
        onDrop={e => {
          e.preventDefault()
          handleCountryDrop(index)
        }}
        onDragEnd={() => {
          setDraggedCountryIndex(null)
          setDragOverCountryIndex(null)
        }}
        onTouchStart={() => {
          setDraggedCountryIndex(index)
        }}
        onTouchMove={e => {
          if (draggedCountryIndex === null) return

          const touch = e.touches[0]

          const element = document.elementFromPoint(
            touch.clientX,
            touch.clientY
          )

          const countryButton = element?.closest(
            '[data-country-index]'
          ) as HTMLElement | null

          if (countryButton) {
            const targetIndex = Number(
              countryButton.dataset.countryIndex
            )

            if (!Number.isNaN(targetIndex)) {
              setDragOverCountryIndex(targetIndex)
            }
          }
        }}
        onTouchEnd={() => {
          if (
            draggedCountryIndex !== null &&
            dragOverCountryIndex !== null
          ) {
            handleCountryDrop(dragOverCountryIndex)
          } else {
            setDraggedCountryIndex(null)
            setDragOverCountryIndex(null)
          }
        }}
        style={{
          padding: '8px 16px',
          borderRadius: 20,

          border: `1px solid ${
            isDragOver
              ? '#4DA3FF'
              : isSelected
              ? '#D4AF37'
              : '#2c2c2e'
          }`,

          background: isDragOver
            ? 'rgba(77,163,255,0.15)'
            : isSelected
            ? 'rgba(212,175,55,0.15)'
            : '#1c1c1e',

          color: isSelected ? '#D4AF37' : '#8e8e93',

          fontSize: 13,
          fontWeight: 600,

          cursor: isDragging ? 'grabbing' : 'grab',

          whiteSpace: 'nowrap',
          flexShrink: 0,

          opacity: isDragging ? 0.5 : 1,

          transform: isDragOver ? 'scale(1.05)' : 'scale(1)',

          transition: 'all 0.15s ease',

          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {country}
      </button>
    )
  })}
</div>


      {/* ABAS DE STATUS (TENHO, BUSCO, FAVORITAS) */}
      <div className="web-collection-tabs" style={{ display: 'flex', gap: 8, background: '#1c1c1e', padding: 4, borderRadius: 12, border: '1px solid #2c2c2e' }}>
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
              ? `Você ainda não marcou nenhuma moeda de ${selectedCountry} como Tenho.`
              : activeStatusTab === 'wanted'
              ? `Sua lista de moedas buscadas de ${selectedCountry} está vazia.`
              : `Você não tem moedas favoritas em ${selectedCountry}.`}
          </p>
        </div>
      ) : (

        <div className="web-collection-grid"
  style={{
    display: 'grid',
    gridTemplateColumns:
      window.innerWidth >= 900
        ? 'repeat(3, minmax(0, 1fr))'
        : '1fr',
    gap: 14,
  }}
>
  {displayedCoins.map(coin => {
        
            const uc = userCoins[coin.id]
            const quantity = uc?.quantity || 1

            return (
              <button
                className="web-collection-coin"
                key={coin.id}
                onClick={() => onCoinClick(coin)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#1c1c1e',
                  border: '1px solid #2c2c2e',
                  borderRadius: 16,
                  padding: window.innerWidth >= 900
                        ? '16px 18px'
                        : '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: window.innerWidth >= 900 ? 86 : 'auto',
                  width: '100%',
                }}
              >
                {/* Visual da Moeda */}
                <div style={{ position: 'relative' }}>
                  <CoinVisual
                  coin={coin}
                   userStatus={uc?.status ?? null}
                   size={window.innerWidth >= 900 ? 64 : 48}
                   />
                </div>

                {/* Informações da Moeda */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#ffffff' }}>{coin.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8e8e93' }}>
                    {coin.year} · {coin.monetaryPlan}
                  </p>
                </div>

                {/* Badge Dourada de Quantidade Repetida */}
                {uc?.status === 'owned' && quantity > 1 && (
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #FFE566, #D4AF37)',
                      color: '#000000',
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: "'Roboto Slab', serif",
                      padding: '2px 8px',
                      borderRadius: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      marginRight: 4,
                    }}
                  >
                    {quantity}x
                  </span>
                )}

                {/* Ícone de Favorito */}
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