// src/data/leaderboard.ts

export interface LeaderboardUser {
  rank: number
  name: string
  coinsCount: number
  avatar: string
}

export const LEADERBOARD_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'Carlos Silva', coinsCount: 142, avatar: '' },
  { rank: 2, name: 'Mariana Costa', coinsCount: 118, avatar: '' },
  { rank: 3, name: 'Sara Lacort', coinsCount: 95, avatar: '' }, // Perfil atual
  { rank: 4, name: 'Roberto Alves', coinsCount: 84, avatar: '' },
  { rank: 5, name: 'Fernanda Lima', coinsCount: 62, avatar: '' },
  { rank: 6, name: 'Lucas Mendes', coinsCount: 45, avatar: '' },
  { rank: 7, name: 'Juliana Rocha', coinsCount: 30, avatar: '' },
]