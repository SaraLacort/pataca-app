import { useState, useMemo, useCallback, useEffect } from 'react'
import { ExportCollectionScreen } from './ExportCollectionScreen'
import { supabase } from './lib/supabaseClient'
import CoinDetailModal from './components/CoinDetailModal'
import AvatarPicker from '../components/AvatarPicker'
import { ALL_COINS } from './data/coins' 


//Screens
import HomeScreen from './screens/HomeScreen'
import CatalogScreen from './screens/CatalogScreen'
import CollectionScreen from './screens/CollectionScreen'
import RankingScreen from './screens/RankingScreen'
import ProfileScreen, { ALL_COLLECTIONS } from './screens/ProfileScreen'
import AuthScreen from './screens/AuthScreen'
import ExportPage from './components/ExportPage'
import EditProfileScreen from './screens/EditProfileScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'




import avatar1 from '/avatars/avatar-01.png'
import avatar2 from '/avatars/avatar-02.png'
import avatar3 from '/avatars/avatar-03.png'
import avatar4 from '/avatars/avatar-04.png'
import avatar5 from '/avatars/avatar-05.png'
import avatar6 from '/avatars/avatar-06.png'
import avatar7 from '/avatars/avatar-07.png'
import avatar8 from '/avatars/avatar-08.png'
import avatar9 from '/avatars/avatar-09.png'
import avatar10 from '/avatars/avatar-10.png'
import logoVertical from './logo.png';

type Tab = 'home' | 'catalog' | 'collection' | 'stats' | 'profile'
type CoinStatus = 'owned' | 'wanted'

interface Coin {
  id: string
  name: string
  faceValue: string
  country: string
  year: number
  decade: string
  monetaryPlan: string
  material: string
  diameter: string
  weight: string
  thickness: string
  edge: string
  mint: string
  mintage: string
  commemorative: boolean
  obverseDescription: string
  reverseDescription: string
  description: string
  curiosities?: string
}

interface UserCoin {
  coinId: string
  status: CoinStatus
  favorite: boolean
  quantity: number
  condition?: string
  paidValue?: number
  acquiredAt?: string
  notes?: string
}

interface UserProfile {
  name: string
  email: string
  avatar?: string
  instagram?: string
  selectedCountries?: string[]
}

// ─── Planos Monetários & Filtros ─────────────────────────────────────────────

const MONETARY_PLANS = [
  'Todos',
  'Real',
  'Cruzeiro',
  'Cruzeiro Novo',
  'Cruzeiro Real',
  'Cruzado Novo',
  'Réis',
  'Cruzado',
  'Dólar Americano',
  'Dólar Canadense',
  'Real Mexicano',
  'Peso Mexicano',
  'Nuevo Peso / Peso Mexicano',
  'Nuevo Peso',
  'Primeiro Peso Dominicano',
  'Franco Dominicano',
  'Peso Oro',
  'Peso Dominicano',
  'Real Colombiano',
  'Peso Colombiano',
  'Primeiro Peso Chileno',
  'Escudo',
  'Segundo Peso Chileno',

]

// ─── Ranking de Colecionadores (Simulação) ─────────────────────────────────

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Carlos Silva', coinsCount: 142, avatar: '' },
  { rank: 2, name: 'Mariana Costa', coinsCount: 118, avatar: '' },
  { rank: 3, name: 'Sara Lacort', coinsCount: 95, avatar: '' }, // Perfil atual
  { rank: 4, name: 'Roberto Alves', coinsCount: 84, avatar: '' },
  { rank: 5, name: 'Fernanda Lima', coinsCount: 62, avatar: '' },
  { rank: 6, name: 'Lucas Mendes', coinsCount: 45, avatar: '' },
  { rank: 7, name: 'Juliana Rocha', coinsCount: 30, avatar: '' },
]

// ─── ALL COINS ────────────────────────────────────────────────────────────────
const DEFAULT_AVATARS_LIST = [
  { id: 'avatar1', src: '/avatars/avatar-01.png', label: 'Avatar 1' },
  { id: 'avatar2', src: '/avatars/avatar-02.png', label: 'Avatar 2' },
  { id: 'avatar3', src: '/avatars/avatar-03.png', label: 'Avatar 3' },
  { id: 'avatar4', src: '/avatars/avatar-04.png', label: 'Avatar 4' },
  { id: 'avatar5', src: '/avatars/avatar-05.png', label: 'Avatar 5' },
  { id: 'avatar6', src: '/avatars/avatar-06.png', label: 'Avatar 6' },
  { id: 'avatar7', src: '/avatars/avatar-07.png', label: 'Avatar 7' },
  { id: 'avatar8', src: '/avatars/avatar-08.png', label: 'Avatar 8' },
  { id: 'avatar9', src: '/avatars/avatar-09.png', label: 'Avatar 9' },
  { id: 'avatar10', src: '/avatars/avatar-10.png', label: 'Avatar 10' },
]


// ─── LISTA DE PAÍSES (COLOQUE AQUI) ──────────────────────────────────────────

const ALL_COUNTRIES = Array.from(
  new Set(ALL_COINS.map(c => c.country).filter(Boolean))
).sort()

const DEFAULT_COINS: Record<string, UserCoin> = {}
// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMaterialGradient(material: string): string {
  const m = material.toLowerCase()
  if (m.includes('prata')) return 'radial-gradient(circle at 32% 28%, #f4f4f6, #c8c8d0, #888894)'
  if (m.includes('ouro')) return 'radial-gradient(circle at 32% 28%, #ffe566, #d4af37, #9a7a1a)'
  if (m.includes('cobre') && !m.includes('cupr')) return 'radial-gradient(circle at 32% 28%, #f0a060, #cd7f32, #7a4010)'
  if (m.includes('bronze')) return 'radial-gradient(circle at 32% 28%, #e0924a, #b87333, #6e3d10)'
  if (m.includes('cuproníquel') || m.includes('cupro')) return 'radial-gradient(circle at 32% 28%, #d8dce8, #a8b4c0, #687888)'
  if (m.includes('bimetálica') || m.includes('bimetali')) return 'radial-gradient(circle at 32% 28%, #e8e0b0, #c8c0a0, #909090)'
  if (m.includes('alumínio') || m.includes('aluminio')) return 'radial-gradient(circle at 32% 28%, #e8e8ec, #c0c0c8, #888890)'
  return 'radial-gradient(circle at 32% 28%, #dcdce4, #b0b0b8, #787880)'
}

function getMaterialRing(material: string): string {
  const m = material.toLowerCase()
  if (m.includes('prata')) return 'rgba(120,120,130,0.4)'
  if (m.includes('ouro')) return 'rgba(160,120,10,0.5)'
  if (m.includes('cobre') && !m.includes('cupr')) return 'rgba(120,60,10,0.5)'
  if (m.includes('bronze')) return 'rgba(100,50,10,0.45)'
  if (m.includes('bimetálica')) return 'rgba(120,110,50,0.4)'
  return 'rgba(80,80,90,0.35)'
}

function getShortValue(faceValue: string): string {
  return faceValue
    .replace('R$ ', '')
    .replace('NCr$ ', '')
    .replace('Cr$ ', '')
    .replace('Cz$ ', '')
    .replace(' Réis', '')
}






// ─── BottomNav ────────────────────────────────────────────────────────────────

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'catalog', icon: '​📚​', label: 'Catálogo' },
    { id: 'collection', icon: '​​🪙​​', label: 'Minhas Coleções' },
    { id: 'stats', icon: '🏆', label: 'Ranking' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ]

  return (
    <nav
      style={{
        display: 'flex',
        borderTop: '1px solid var(--border, #2c2c2e)',
        background: 'rgba(12,12,14,0.96)',
        flexShrink: 0,
      }}
    >
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '10px 4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: active === t.id ? 1 : 0.5,
          }}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, color: active === t.id ? '#4DA3FF' : 'var(--muted-foreground, #8e8e93)' }}>
            {t.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

// ─── AuthScreen ───────────────────────────────────────────────────────────────

interface UserProfile {
  name: string
  email: string
}


// ─── App Component (Main) ───────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [tabHistory, setTabHistory] = useState<Tab[]>(['home'])
  const [userCoins, setUserCoins] = useState<Record<string, UserCoin>>({})
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true) // <-- Trava inicial
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showExportPage, setShowExportPage] = useState(false)

const [isResettingPassword, setIsResettingPassword] = useState<boolean>(() => {
  const hash = window.location.hash
  const search = window.location.search
  return hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('access_token')
})

  // 1. Carrega e valida sessão rigorosamente antes de abrir qualquer tela
useEffect(() => {
  let isMounted = true

  // Se houver erro de link expirado na URL, avisa o usuário
  if (window.location.hash.includes('error_code=otp_expired')) {
    alert('Este link de recuperação expirou ou já foi utilizado. Solicite um novo.')
    window.history.replaceState(null, '', window.location.pathname)
    setIsAuthChecking(false)
    setIsLoggedIn(false)
    return
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || window.location.hash.includes('type=recovery')) {
      setIsResettingPassword(true)
      setIsAuthChecking(false)
      return
    }

    if (session?.user) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
      setUserProfile(null)
      setUserCoins({})
    }
  })

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        if (isMounted) {
          setIsLoggedIn(false)
          setUserProfile(null)
          setUserCoins({})
          setIsAuthChecking(false)
        }
        return
      }

      if (window.location.hash.includes('type=recovery')) {
        if (isMounted) {
          setIsResettingPassword(true)
          setIsAuthChecking(false)
        }
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (isMounted) {
        if (profileData) {
          setUserProfile({
            name: profileData.name || '',
            email: profileData.email || session.user.email || '',
            avatar: profileData.avatar || '/avatars/avatar-01.png',
            instagram: profileData.instagram || '',
            selectedCountries: profileData.selected_countries || ['Brasil'],
          })
        }

        const { data: coinsData } = await supabase
          .from('user_coins')
          .select('coins')
          .eq('user_id', session.user.id)
          .single()

        if (coinsData?.coins) {
          setUserCoins(coinsData.coins)
        }

        setIsLoggedIn(true)
        setIsAuthChecking(false)
      }
    } catch (err) {
      console.error('Erro na checagem de sessão:', err)
      if (isMounted) {
        setIsLoggedIn(false)
        setIsAuthChecking(false)
      }
    }
  }

  checkSession()

  return () => {
    isMounted = false
    subscription.unsubscribe()
  }
}, [])

// 2. Atualiza o horário de atividade com cliques e toques
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem('@app_last_activity', Date.now().toString())
    }

    window.addEventListener('click', updateActivity, { passive: true })
    window.addEventListener('touchstart', updateActivity, { passive: true })
    window.addEventListener('keydown', updateActivity, { passive: true })

    return () => {
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('touchstart', updateActivity)
      window.removeEventListener('keydown', updateActivity)
    }
  }, [])

  // 3. Gerencia evento de Voltar do Aparelho
  useEffect(() => {
    const handlePopState = () => {
      if (selectedCoin) {
        setSelectedCoin(null)
      } else if (tabHistory.length > 1) {
        const newHistory = [...tabHistory]
        newHistory.pop()
        const previousTab = newHistory[newHistory.length - 1]
        setTabHistory(newHistory)
        setActiveTab(previousTab)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tabHistory, selectedCoin])

  // Troca de abas direta sem disparar recarregamento
  const handleTabChange = useCallback((newTab: Tab) => {
    setIsEditingProfile(false)
    if (newTab !== activeTab) {
      setTabHistory(prev => [...prev, newTab])
      setActiveTab(newTab)
    }
  }, [activeTab])

  // Salva alterações do perfil no Supabase e no estado local
  const handleSaveProfile = useCallback(async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    setIsEditingProfile(false)
    localStorage.setItem('@app_session', JSON.stringify(updatedProfile))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            avatar: updatedProfile.avatar,
            instagram: updatedProfile.instagram,
            selected_countries: updatedProfile.selectedCountries || ['Brasil'],
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Erro ao salvar perfil no Supabase:', error)
        }
      }
    } catch (err) {
      console.error('Erro na requisição ao salvar perfil:', err)
    }
  }, [])

  // 5. Botão manual de voltar
  const handleGoBack = useCallback(() => {
    if (selectedCoin) {
      setSelectedCoin(null)
    } else if (tabHistory.length > 1) {
      window.history.back()
    }
  }, [tabHistory, selectedCoin])


// 6. Atualiza status da moeda e sincroniza coleções automaticamente
  const handleUpdateStatus = useCallback(async (coinId: string, status: CoinStatus | null, quantity: number = 1) => {
    setUserCoins(prev => {
      let updatedCoins: Record<string, UserCoin>

      // 1. Atualiza ou remove a moeda
      if (!status) {
        const next = { ...prev }
        delete next[coinId]
        updatedCoins = next
      } else {
        updatedCoins = {
          ...prev,
          [coinId]: {
            ...(prev[coinId] ?? { coinId, favorite: false }),
            status,
            quantity: status === 'owned' ? quantity : 0,
          },
        }
      }

      // 2. Identifica os países que ainda possuem pelo menos uma moeda ativa
      const activeCoinIds = Object.keys(updatedCoins).filter(id => {
        const coin = updatedCoins[id]
        return coin && (coin.status === 'owned' || coin.status === 'wanted' || coin.favorite)
      })

      const activeCountries = Array.from(
        new Set(
          activeCoinIds
            .map(id => ALL_COINS.find(c => String(c.id) === String(id))?.country)
            .filter(Boolean) as string[]
        )
      )

      // Garante que Brasil permaneça como padrão caso fique vazio
      const updatedCountries = activeCountries.length > 0 ? activeCountries : ['Brasil']

      // 3. Atualiza o perfil se a lista de coleções mudou
      if (userProfile) {
        const currentCountries = userProfile.selectedCountries || ['Brasil']
        const hasChanged = 
          currentCountries.length !== updatedCountries.length ||
          !currentCountries.every(c => updatedCountries.includes(c))

        if (hasChanged) {
          const updatedProfile = { ...userProfile, selectedCountries: updatedCountries }
          setUserProfile(updatedProfile)
          localStorage.setItem('@app_session', JSON.stringify(updatedProfile))

          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
              supabase
                .from('profiles')
                .update({ 
                  selected_countries: updatedCountries,
                  updated_at: new Date().toISOString() 
                })
                .eq('id', session.user.id)
                .then(({ error }) => {
                  if (error) console.error('Erro ao atualizar coleções no perfil:', error)
                })
            }
          })
        }
      }

      // 4. Salva as moedas no Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          supabase
            .from('user_coins')
            .upsert({ 
              user_id: session.user.id, 
              coins: updatedCoins, 
              updated_at: new Date().toISOString() 
            })
            .then(({ error }) => {
              if (error) console.error('Erro ao salvar moedas :', error)
            })
        }
      })

      return updatedCoins
    })
  }, [userProfile])

  // 7. Alterna o estado de favorita
  const handleToggleFavorite = useCallback((coinId: string) => {
    setUserCoins(prev => {
      const existing = prev[coinId]
      let updated: Record<string, UserCoin>

      if (existing) {
        updated = { ...prev, [coinId]: { ...existing, favorite: !existing.favorite } }
      } else {
        updated = { ...prev, [coinId]: { coinId, status: 'wanted', favorite: true, quantity: 0 } }
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          supabase
            .from('user_coins')
            .upsert({ 
              user_id: session.user.id, 
              coins: updated, 
              updated_at: new Date().toISOString() 
            })
            .then(({ error }) => {
              if (error) console.error('Erro ao salvar favoritos no Supabase:', error)
            })
        }
      })

      return updated
    })
  }, [])

  const handleOpenCoinDetail = useCallback((coin: Coin) => {
    window.history.pushState({ modal: coin.id }, '')
    setSelectedCoin(coin)
  }, [])

// Login bem-sucedido
  const handleLoginSuccess = useCallback(async (profile: UserProfile) => {
    setUserProfile(profile)
    setActiveTab('home')
    setTabHistory(['home'])
    setIsLoggedIn(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) return

      const { data } = await supabase
        .from('user_coins')
        .select('coins')
        .eq('user_id', userId)
        .single()

      if (data && data.coins) {
        setUserCoins(data.coins)
      } else {
        await supabase
          .from('user_coins')
          .insert([{ user_id: userId, coins: {} }])

        setUserCoins({})
      }
    } catch (err) {
      console.error('Erro ao carregar moedas:', err)
      setUserCoins({})
    }
  }, [])

  // Logout definitivo
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('Erro ao deslogar do Supabase:', err)
    }

    localStorage.clear()
    sessionStorage.clear()

    setIsLoggedIn(false)
    setUserProfile(null)
    setUserCoins({})
    setIsEditingProfile(false)
    setActiveTab('home')
    setTabHistory(['home'])
  }, [])

  // 10. Telas do App (declaradas antes de qualquer return)
  const screens: Record<Tab, React.ReactNode> = {
    home: <HomeScreen userCoins={userCoins} userProfile={userProfile} onTabChange={handleTabChange} onCoinClick={handleOpenCoinDetail} />,
    catalog: <CatalogScreen userCoins={userCoins} onCoinClick={handleOpenCoinDetail} onUpdateStatus={handleUpdateStatus} />,
    collection: <CollectionScreen userCoins={userCoins} userProfile={userProfile} onCoinClick={handleOpenCoinDetail} />,
    stats: <RankingScreen userCoins={userCoins} userProfile={userProfile} />,
    profile: isEditingProfile ? (
      <EditProfileScreen
        profile={userProfile}
        userProfile={userProfile}
        userCoins={userCoins}
        onSave={handleSaveProfile}
        onCancel={() => setIsEditingProfile(false)}
      />
    ) : (
      <ProfileScreen
        userCoins={userCoins}
        userProfile={userProfile}
        onLogout={handleLogout}
        onEditProfile={() => setIsEditingProfile(true)}
      />
    ),
  }

  // 11. Travas de tela (no final de tudo, antes do JSX principal)
// 1. Carregando
if (isAuthChecking) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', background: '#0c0c0e', color: '#d4af37', fontFamily: "'Roboto Slab', serif", fontSize: 20 }}>
      Pataca...
    </div>
  )
}

// 2. Recuperando senha
if (isResettingPassword) {
  return (
    <ResetPasswordScreen
      onSuccess={() => {
        window.history.replaceState(null, '', window.location.pathname)
        setIsResettingPassword(false)
        setActiveTab('home')
      }}
    />
  )
}

// 3. Não logado
if (!isLoggedIn) {
  return <AuthScreen onLogin={handleLoginSuccess} />
}
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        background: '#0c0c0e',
        color: '#ffffff',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px 10px',
          borderBottom: '1px solid #2c2c2e',
          flexShrink: 0,
          background: 'rgba(12,12,14,0.96)',
          zIndex: 10,
        }}
      >
        {activeTab !== 'home' ? (
          <button
            onClick={handleGoBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#4DA3FF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 0,
            }}
          >
            ← Voltar
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 45,
                height: 45,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgb(163, 157, 137), rgb(78, 75, 67))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <img src="/logo.png" alt="Ícone Pataca" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontFamily: "'Roboto Slab', serif", fontSize: 30, fontWeight: 700 }}>
              Pataca
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 20px 12px',
        }}
      >
        {screens[activeTab]}
      </div>

      {/* Menu Inferior */}
      <BottomNav active={activeTab} onChange={handleTabChange} />

      {/* Modal da Moeda */}
      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          userCoin={userCoins[selectedCoin.id]}
          onClose={() => setSelectedCoin(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {showExportPage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: '#0c0c0e',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              minHeight: '100vh',
              background: '#0c0c0e',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <ExportPage
              userCollection={userCoins}
              onBack={() => setShowExportPage(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}