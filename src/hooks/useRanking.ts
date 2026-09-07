import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { UserCoin, UserProfile } from '../types'

export interface RankingRow {
  user_id: string
  name: string
  avatar: string
  coins_count: number
}

export interface RankingEntry {
  id: string
  name: string
  avatar: string
  coinsCount: number
  isMe: boolean
  isDemo: boolean
  rank: number
}

const INITIAL_SIZE = 200
const DEFAULT_AVATAR = '/avatars/avatar-01.png'

// Os mesmos participantes demonstrativos em todas as telas e dispositivos.
const DEMO_ENTRIES = Array.from({ length: INITIAL_SIZE }, (_, index) => {
  const names = ['Carlos', 'Mariana', 'Roberto', 'Fernanda', 'Lucas', 'Juliana', 'Gabriel', 'Beatriz', 'Rodrigo', 'Camila']
  const surnames = ['Silva', 'Costa', 'Alves', 'Lima', 'Mendes', 'Rocha', 'Oliveira', 'Santos', 'Pereira', 'Ferreira']
  const number = index + 1
  return {
    id: `demo-${String(number).padStart(3, '0')}`,
    name: `${names[index % names.length]} ${surnames[Math.floor(index / names.length) % surnames.length]}`,
    avatar: `/avatars/avatar-${String(index % 10 + 1).padStart(2, '0')}.png`,
    coinsCount: Math.max(3, 145 - index),
    isMe: false,
    isDemo: true,
  }
})

export function buildRanking(
  rows: RankingRow[],
  myId: string,
  userCoins: Record<string, UserCoin>,
  userProfile: UserProfile | null,
): RankingEntry[] {
  const real = new Map(rows.map(row => [row.user_id, {
    id: row.user_id,
    name: row.name?.trim() || 'Colecionador',
    avatar: row.avatar?.trim() || DEFAULT_AVATAR,
    coinsCount: Math.max(0, Number(row.coins_count) || 0),
    isMe: row.user_id === myId,
    isDemo: false,
  }]))

  // Usa o identificador da conta, nunca o nome, para evitar duplicar você.
  if (myId && userProfile) {
    real.set(myId, {
      id: myId,
      name: userProfile.name?.trim() || 'Colecionador',
      avatar: userProfile.avatar?.trim() || DEFAULT_AVATAR,
      coinsCount: Object.values(userCoins).filter(coin => coin.status === 'owned').length,
      isMe: true,
      isDemo: false,
    })
  }

  const demoCount = Math.max(0, INITIAL_SIZE - real.size)
  const entries = [...real.values(), ...DEMO_ENTRIES.slice(0, demoCount)]
  entries.sort((a, b) =>
    b.coinsCount - a.coinsCount ||
    Number(a.isDemo) - Number(b.isDemo) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  )
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }))
}

export function useRanking(userCoins: Record<string, UserCoin>, userProfile: UserProfile | null) {
  const [snapshot, setSnapshot] = useState<{ rows: RankingRow[]; myId: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision(value => value + 1), [])

  useEffect(() => {
    // Também atualiza quando a pessoa volta de outra aba do navegador.
    window.addEventListener('focus', reload)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') reload()
    })
    return () => {
      window.removeEventListener('focus', reload)
      subscription.unsubscribe()
    }
  }, [reload])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        const myId = sessionData.session?.user.id
        if (!myId) throw new Error('Entre na sua conta para consultar o ranking.')

        const rows: RankingRow[] = []
        // Busca todas as páginas, inclusive se o servidor tiver um limite menor.
        let offset = 0
        while (!cancelled) {
          const { data, error: queryError } = await supabase
            .rpc('get_pataca_ranking')
            .order('user_id', { ascending: true })
            .range(offset, offset + 999)
          if (queryError) throw queryError
          const page = (data ?? []) as RankingRow[]
          if (page.length === 0) break
          rows.push(...page)
          offset += page.length
        }
        if (!cancelled) setSnapshot({ rows, myId })
      } catch (cause) {
        console.error('Erro ao carregar ranking:', cause)
        if (!cancelled) {
          setSnapshot(null)
          setError('Não foi possível carregar o ranking. Tente novamente.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [revision])

  const entries = useMemo(() => snapshot
    ? buildRanking(snapshot.rows, snapshot.myId, userCoins, userProfile)
    : [], [snapshot, userCoins, userProfile])
  const me = entries.find(entry => entry.isMe)
  const realCount = entries.filter(entry => !entry.isDemo).length
  return {
    entries,
    myRank: me?.rank ?? null,
    realCount,
    demoCount: entries.length - realCount,
    loading,
    error,
    reload,
  }
}
