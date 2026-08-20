import React from 'react'
import CoinVisual from './CoinVisual'
// Importe os tipos do seu arquivo central de tipos (ajuste o caminho se necessário)
import { Coin, UserCoin, CoinStatus } from '../types'

function CoinCard({
  coin,
  userCoin,
  onClick,
  onQuickToggleStatus,
}: {
  coin: Coin
  userCoin?: UserCoin
  onClick: () => void
  onQuickToggleStatus?: (e: React.MouseEvent) => void
}) {
  const statusColors: Record<CoinStatus, string> = {
    owned: '#4CAF50',
    wanted: '#FFB300',
  }

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede a abertura do modal ao clicar na tag de status
    if (onQuickToggleStatus) {
      onQuickToggleStatus(e)
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card, #1c1c1e)',
        border: `1px solid var(--border, #2c2c2e)`,
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {coin.commemorative && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          }}
        />
      )}

      <CoinVisual coin={coin} userStatus={userCoin?.status ?? null} size={68} />

      <div style={{ width: '100%' }}>
        <p
          style={{
            fontFamily: "'Roboto Slab', serif",
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--card-foreground, #ffffff)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {coin.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted-foreground, #8e8e93)', margin: '2px 0 0', lineHeight: 1 }}>
          {coin.year} · {coin.monetaryPlan}
        </p>
      </div>

      <button
        type="button"
        onClick={handleStatusClick}
        title="Clique para alternar: Tenho -> Buscando -> Faltando"
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          background: userCoin
            ? statusColors[userCoin.status] + '22'
            : 'rgba(255,255,255,0.08)',
          color: userCoin ? statusColors[userCoin.status] : 'var(--muted-foreground, #8e8e93)',
          border: `1px solid ${userCoin ? statusColors[userCoin.status] + '55' : 'rgba(255,255,255,0.12)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {userCoin?.status === 'owned' ? '✓ Tenho' : userCoin?.status === 'wanted' ? '★ Buscando' : '+ Faltando'}
      </button>
    </div>
  )
}

export default CoinCard