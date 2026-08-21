import React, { useState } from 'react'
import CoinVisual from './CoinVisual'
// Importe as tipagens do seu projeto (ajuste o caminho se necessário)
import { Coin, UserCoin, CoinStatus, UserProfile } from '../types'

// Função para comparar nomes ignorando acentos, espaços e maiúsculas
const normalizeCountry = (text: any = '') =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

interface CoinDetailModalProps {
  coin: Coin
  userCoin?: UserCoin
  userProfile?: UserProfile | null
  onClose: () => void
  onUpdateStatus: (coinId: string, status: CoinStatus | null) => void
  onToggleFavorite: (coinId: string) => void
}

function CoinDetailModal({
  coin,
  userCoin,
  userProfile,
  onClose,
  onUpdateStatus,
  onToggleFavorite,
}: CoinDetailModalProps) {
  const [imageView, setImageView] = useState<'front' | 'back'>('front')

  // Varredura completa para descobrir os países ativos do usuário
  const getActiveCountries = (): string[] => {
    // 1. Tenta pegar direto das props recebidas
    if (userProfile?.selectedCountries && userProfile.selectedCountries.length > 0) {
      return userProfile.selectedCountries
    }

    // 2. Procura em todas as chaves do localStorage
    try {
      // Tenta @app_session
      const sessionRaw = localStorage.getItem('@app_session')
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw)
        if (parsed?.selectedCountries && Array.isArray(parsed.selectedCountries) && parsed.selectedCountries.length > 0) {
          return parsed.selectedCountries
        }
      }

      // Tenta @app_users ou qualquer chave de usuário logado
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('user') || key.includes('profile') || key.includes('session'))) {
          const raw = localStorage.getItem(key)
          if (raw) {
            try {
              const data = JSON.parse(raw)
              // Se for o objeto direto do usuário
              if (data?.selectedCountries && Array.isArray(data.selectedCountries) && data.selectedCountries.length > 0) {
                return data.selectedCountries
              }
              // Se for um dicionário de usuários: { "email@...": { selectedCountries: [...] } }
              if (typeof data === 'object') {
                for (const item of Object.values(data)) {
                  if ((item as any)?.selectedCountries && Array.isArray((item as any).selectedCountries)) {
                    return (item as any).selectedCountries
                  }
                }
              }
            } catch (e) {
              // ignora dados que não são JSON
            }
          }
        }
      }
    } catch (e) {
      console.error('Erro ao ler coleções salvas', e)
    }

    // Se realmente não encontrar nada, o padrão é apenas o Brasil
    return ['Brasil']
  }

  // Intercepta a mudança de status
  const handleStatusChange = (newStatus: CoinStatus | null) => {
    if (newStatus !== null) {
      const activeCountries = getActiveCountries()
      const coinCountryNorm = normalizeCountry(coin.country)

      const isAllowed = activeCountries.some(
        countryName => normalizeCountry(countryName) === coinCountryNorm
      )

      
    }

    onUpdateStatus(coin.id, newStatus)
  }

  const fields = [
    { label: 'País', value: coin.country },
    { label: 'Plano Monetário', value: coin.monetaryPlan },
    { label: 'Material', value: coin.material },
    { label: 'Diâmetro', value: coin.diameter },
    { label: 'Peso', value: coin.weight },
    { label: 'Espessura', value: coin.thickness },
    { label: 'Borda', value: coin.edge },
    { label: 'Casa da Moeda', value: coin.mint },
    { label: 'Quantidade emitida', value: coin.mintage },
    { label: 'Tipo', value: coin.commemorative ? 'Comemorativa' : 'Circulação' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--card, #1c1c1e)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
      >
        {coin.commemorative && (
          <div
            style={{
              height: 4,
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              borderRadius: '24px 24px 0 0',
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border, #2c2c2e)' }} />
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#2c2c2e',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#8e8e93',
          }}
        >
          ×
        </button>

        <div style={{ padding: '8px 20px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <CoinVisual coin={coin} userStatus={userCoin?.status ?? null} size={120} side={imageView} />

            <div style={{ display: 'flex', gap: 0, background: '#2c2c2e', borderRadius: 10, padding: 3 }}>
              {(['front', 'back'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setImageView(v)}
                  style={{
                    padding: '6px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: imageView === v ? '#1c1c1e' : 'transparent',
                    color: imageView === v ? '#ffffff' : '#8e8e93',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {v === 'front' ? 'Anverso' : 'Reverso'}
                </button>
              ))}
            </div>

            <div style={{ background: '#2c2c2e', borderRadius: 14, padding: 14, width: '100%', boxSizing: 'border-box' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#8e8e93', textAlign: 'center', fontStyle: 'italic' }}>
                {imageView === 'front' ? coin.obverseDescription : coin.reverseDescription}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 24, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {coin.name}
              </h2>
              {coin.commemorative && (
                <span
                  style={{
                    fontSize: 12,
                    color: '#D4AF37',
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontWeight: 600,
                  }}
                >
                  ⭐ COMEMORATIVA
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8e8e93' }}>
              {coin.country} · {coin.year} · {coin.faceValue}
            </p>
          </div>

          {/* BOTÕES DE STATUS COM A TRAVA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            <button
              onClick={() => handleStatusChange(userCoin?.status === 'owned' ? null : 'owned')}
              style={{
                padding: '12px 8px',
                borderRadius: 14,
                border: `2px solid ${userCoin?.status === 'owned' ? '#4CAF50' : '#2c2c2e'}`,
                background: userCoin?.status === 'owned' ? 'rgba(76,175,80,0.15)' : '#2c2c2e',
                color: userCoin?.status === 'owned' ? '#4CAF50' : '#8e8e93',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>✅</span>
              Tenho
            </button>
            <button
              onClick={() => handleStatusChange(userCoin?.status === 'wanted' ? null : 'wanted')}
              style={{
                padding: '12px 8px',
                borderRadius: 14,
                border: `2px solid ${userCoin?.status === 'wanted' ? '#FFB300' : '#2c2c2e'}`,
                background: userCoin?.status === 'wanted' ? 'rgba(255,179,0,0.15)' : '#2c2c2e',
                color: userCoin?.status === 'wanted' ? '#FFB300' : '#8e8e93',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>⭐</span>
              Buscando
            </button>
            <button
              onClick={() => onToggleFavorite(coin.id)}
              style={{
                padding: '12px 8px',
                borderRadius: 14,
                border: `2px solid ${userCoin?.favorite ? '#EF5350' : '#2c2c2e'}`,
                background: userCoin?.favorite ? 'rgba(239,83,80,0.15)' : '#2c2c2e',
                color: userCoin?.favorite ? '#EF5350' : '#8e8e93',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{userCoin?.favorite ? '❤️' : '🤍'}</span>
              Favoritar
            </button>
          </div>

          <div style={{ background: '#2c2c2e', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            {fields.map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: i < fields.length - 1 ? '1px solid #1c1c1e' : 'none',
                }}
              >
                <span style={{ fontSize: 13, color: '#8e8e93' }}>{f.label}</span>
                <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: coin.curiosities ? 16 : 0 }}>
            <h4 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 14, fontWeight: 600, margin: '0 0 8px', color: '#ffffff' }}>
              Descrição
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: '#8e8e93', lineHeight: 1.6 }}>{coin.description}</p>
          </div>

          {coin.curiosities && (
            <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: 14 }}>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#D4AF37',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                💡 Curiosidades
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#8e8e93', lineHeight: 1.6 }}>{coin.curiosities}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoinDetailModal