import React, { useMemo } from 'react'
import { UserCoin, UserProfile } from '../types'

interface RankingScreenProps {
  userCoins: Record<string, UserCoin>
  userProfile: UserProfile | null
}

export function RankingScreen({
  userCoins,
  userProfile,
}: RankingScreenProps) {
  const myOwnedCount = useMemo(() => {
    return Object.values(userCoins).filter(u => u.status === 'owned').length
  }, [userCoins])

  const myName = userProfile?.name?.trim() || 'Colecionador'
  const myAvatar = userProfile?.avatar || '/avatars/avatar-01.png'

  const leaderboard = useMemo(() => {
    // Listas separadas por gênero
    const maleNames = ['Carlos', 'Roberto', 'Lucas', 'Gabriel', 'Rodrigo']
    const femaleNames = ['Mariana', 'Fernanda', 'Juliana', 'Beatriz', 'Camila']
    const lastNames = ['Silva', 'Costa', 'Alves', 'Lima', 'Mendes', 'Rocha', 'Oliveira', 'Santos', 'Pereira', 'Ferreira']

    // Avatares distribuídos por gênero
    const femaleAvatars = [
      '/avatars/avatar-03.png',
      '/avatars/avatar-06.png',
      '/avatars/avatar-07.png',
      '/avatars/avatar-08.png',
      '/avatars/avatar-09.png',
      '/avatars/avatar-10.png',
    ]

    const maleAvatars = [
      '/avatars/avatar-02.png',
      '/avatars/avatar-04.png',
      '/avatars/avatar-01.png',
      '/avatars/avatar-05.png',
    ]

    const mockList = []
    let currentCoins = 145

    for (let i = 1; i <= 200; i++) {
      const isFemale = i % 2 === 0
      const firstName = isFemale
        ? femaleNames[(i * 3) % femaleNames.length]
        : maleNames[(i * 7) % maleNames.length]

      const lastName = lastNames[(i * 13) % lastNames.length]
      const avatar = isFemale
        ? femaleAvatars[i % femaleAvatars.length]
        : maleAvatars[i % maleAvatars.length]

      const step = (i % 3 === 0) ? 1 : (i % 5 === 0) ? 0 : 1
      currentCoins = Math.max(3, currentCoins - step)

      mockList.push({
        name: `${firstName} ${lastName}`,
        coinsCount: currentCoins,
        avatar: avatar,
        isMe: false,
      })
    }

    // Adiciona o usuário logado
    const fullList = [
      ...mockList,
      {
        name: myName,
        coinsCount: myOwnedCount,
        avatar: myAvatar,
        isMe: true,
      },
    ]

    // Ordena por pontuação
    fullList.sort((a, b) => b.coinsCount - a.coinsCount)

    // Atribui a posição no ranking
    const rankedList = fullList.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    // Limita aos 10 primeiros visíveis (incluindo você caso fique de fora do top 9)
    const myIndex = rankedList.findIndex(u => u.isMe)

    if (myIndex < 10) {
      return rankedList.slice(0, 10)
    }

    const top9 = rankedList.slice(0, 9)
    const me = rankedList[myIndex]

    return [...top9, me]
  }, [myName, myAvatar, myOwnedCount])

  const myRankData = leaderboard.find(u => u.isMe)
  const myRank = myRankData ? myRankData.rank : '-'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 16 }}>
      <div>
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
          Ranking de Colecionadores
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
          Confira quem tem os maiores acervos numismáticos
        </p>
      </div>

      {/* CARD COM A POSIÇÃO ATUAL DO USUÁRIO */}
      <div
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
            Sua Posição (#{myRank})
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
            {myName}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontFamily: "'Roboto Slab', serif", fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
            {myOwnedCount}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#8e8e93' }}>moedas</p>
        </div>
      </div>

      {/* LISTA DOS TOP 10 */}
      <div style={{ background: '#1c1c1e', borderRadius: 18, border: '1px solid #2c2c2e', overflow: 'hidden' }}>
        {leaderboard.map((u, i) => {
          const isMe = u.isMe
          const badgeColor =
            u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`

          return (
            <div
              key={`${u.name}-${u.rank}`}
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