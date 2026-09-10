import React from 'react'
import { useRanking } from '../hooks/useRanking'
import { UserCoin, UserProfile } from '../types'

interface RankingScreenProps {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
}

export function RankingScreen({
  userCoins,
  userProfile,
}: RankingScreenProps) {
const myOwnedCount = Object.values(userCoins).filter(
  coin => coin.status === 'owned'
).length

  const myName = userProfile?.name?.trim() || 'Colecionador'
  const myAvatar = userProfile?.avatar || '/avatars/avatar-01.png'

  const { entries, myRank, loading, error } = useRanking(userCoins, userProfile, true)
  const me = entries.find(entry => entry.isMe)
  const leaderboard = me && me.rank > 10
    ? [...entries.slice(0, 9), me]
    : entries.slice(0, 10)

  return (
    <div className="web-ranking" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 16 }}>
      <div className="web-screen-heading">
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
          Ranking de Colecionadores
        </h1>
      </div>

      {/* CARD COM A POSIÇÃO ATUAL DO USUÁRIO */}
      <div className="web-ranking-self"
        style={{
          background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)',
          borderRadius: 18,
          padding: 16,
          border: '1px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <img
          src={myAvatar}
          alt={myName}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '2px solid #D4AF37',
            objectFit: 'cover',
          }}
        />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase' }}>
            Sua Posição {loading ? '(…)' : error || !myRank ? '(—)' : `(#${myRank})`}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
            {myName}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontFamily: "'Roboto Slab', serif", fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
            {me?.coinsCount ?? myOwnedCount}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#8e8e93' }}>moedas</p>
        </div>
      </div>

      {loading && <p role="status" style={{ margin: 0, fontSize: 12, color: '#8e8e93' }}>Carregando participantes...</p>}
      {error && <p role="alert" style={{ margin: 0, fontSize: 12, color: '#ff9999' }}>{error}</p>}

      {/* LISTA DAS POSIÇÕES VISÍVEIS */}
      <div className="web-ranking-list" style={{ background: '#1c1c1e', borderRadius: 18, border: '1px solid #2c2c2e', overflow: 'hidden' }}>
        {!loading && !error && leaderboard.map((u, i) => {
          const isMe = u.isMe
          const badgeColor =
            u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`

          return (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: isMe ? 'rgba(212,175,55,0.08)' : 'transparent',
                borderBottom: i < leaderboard.length - 1 ? '1px solid #2c2c2e' : 'none',
              }}
            >
              <span
                style={{
                  width: 28,
                  textAlign: 'center',
                  fontSize: typeof badgeColor === 'string' && badgeColor.startsWith('#') ? 13 : 18,
                  fontWeight: 700,
                  color: isMe ? '#D4AF37' : '#8e8e93',
                }}
              >
                {badgeColor}
              </span>

              {/* IMAGEM DO AVATAR COERENTE */}
              <img
                src={u.avatar}
                alt={u.name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: isMe ? '2px solid #D4AF37' : '1px solid #3c3c3e',
                  objectFit: 'cover',
                }}
              />

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: isMe ? 700 : 500, color: isMe ? '#D4AF37' : '#ffffff' }}>
                  {u.name} {isMe && '(Você)'}
                  {u.isDemo && <span style={{ display: 'block', fontSize: 10, fontWeight: 400, color: '#8e8e93' }}>Instagram não preenchido</span>}
                </p>
              </div>

              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                {u.coinsCount} <span style={{ fontSize: 11, fontWeight: 400, color: '#8e8e93' }}>moedas</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RankingScreen