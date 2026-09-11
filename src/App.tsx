import { useState, useCallback, useEffect, useRef } from 'react'
import type { Coin, CoinStatus, Tab, UserCoin, UserProfile as BaseUserProfile } from './types'
import { supabase } from './lib/supabaseClient'
import CoinDetailModal from './components/CoinDetailModal'
import DesktopLayout from './components/DesktopLayout'
import { ALL_COINS } from './data/coins' 

//Screens
import HomeScreen from './screens/HomeScreen'
import CatalogScreen from './screens/CatalogScreen'
import CollectionScreen from './screens/CollectionScreen'
import RankingScreen from './screens/RankingScreen'
import ProfileScreen from './screens/ProfileScreen'
import AuthScreen from './screens/AuthScreen'
import ExportPage from './components/ExportPage'
import EditProfileScreen from './screens/EditProfileScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import PatacaLanding from './screens/Landing'
import CoinImageUploader from './screens/CoinImageUploader'

import logoVertical from './logo.png';

interface UserProfile extends BaseUserProfile {
  avatar?: string
  instagram?: string
  selectedCountries?: string[]
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

// ─── App Component (Main) ───────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isEnteringApp, setIsEnteringApp] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [tabHistory, setTabHistory] = useState<Tab[]>(['home'])
  const [userCoins, setUserCoins] = useState<Record<string, UserCoin>>({})
  const userCoinsRef = useRef<Record<string, UserCoin>>({})
  useEffect(() => {userCoinsRef.current = userCoins}, [userCoins])
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true) // <-- Trava inicial
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showExportPage, setShowExportPage] = useState(false)
  const [showCoinImageUploader, setShowCoinImageUploader] =useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(() => {
  const hash = window.location.hash
  const search = window.location.search
  return hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('access_token')
})
const [isDesktop, setIsDesktop] = useState(
  () => window.innerWidth >= 900
)

useEffect(() => {
  const handleResize = () => {
    setIsDesktop(window.innerWidth >= 900)
  }

  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])

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
  // Sempre que trocar de aba, fecha telas internas do perfil
  setIsEditingProfile(false)
  setShowExportPage(false)

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
const handleUpdateStatus = useCallback(
  async (
    coinId: string,
    status: CoinStatus | null,
    quantity: number = 1
  ) => {
    // ============================================================
    // 1. PEGA O ESTADO MAIS ATUAL DAS MOEDAS
    // ============================================================
    const previousCoins = userCoinsRef.current

    let updatedCoins: Record<string, UserCoin>

    // ============================================================
    // 2. ATUALIZA OU REMOVE A MOEDA
    // ============================================================
    if (!status) {
      updatedCoins = { ...previousCoins }
      delete updatedCoins[coinId]
    } else {
      const existingCoin = previousCoins[coinId]

      updatedCoins = {
        ...previousCoins,
        [coinId]: {
          ...(existingCoin ?? {
            coinId,
            favorite: false,
          }),
          status,
          quantity: status === 'owned'
            ? Math.max(1, quantity)
            : 0,
        },
      }
    }

    // ============================================================
    // 3. ATUALIZA A REFERÊNCIA IMEDIATAMENTE
    // ============================================================
    userCoinsRef.current = updatedCoins

    // ============================================================
    // 4. ATUALIZA A INTERFACE
    // ============================================================
    setUserCoins(updatedCoins)

    // ============================================================
    // 5. DESCOBRE QUAIS PAÍSES POSSUEM MOEDAS ATIVAS
    //
    // Um país entra em selectedCountries quando existe pelo menos
    // uma moeda daquele país com:
    //
    // - status = owned
    // - status = wanted
    // - ou favorite = true
    //
    // ============================================================
    const activeCoinIds = Object.keys(updatedCoins).filter(id => {
      const userCoin = updatedCoins[id]

      return (
        userCoin &&
        (
          userCoin.status === 'owned' ||
          userCoin.status === 'wanted' ||
          userCoin.favorite
        )
      )
    })

    const activeCountries = Array.from(
      new Set(
        activeCoinIds
          .map(id => {
            const coin = ALL_COINS.find(
              c => String(c.id) === String(id)
            )

            return coin?.country
          })
          .filter(Boolean) as string[]
      )
    )

    // Brasil continua sendo o país padrão quando não existe nenhuma
    // moeda ativa.
    const updatedCountries =
      activeCountries.length > 0
        ? activeCountries
        : ['Brasil']

    // ============================================================
    // 6. ATUALIZA selectedCountries NO PERFIL
    // ============================================================
    if (userProfile) {
      const currentCountries =
        userProfile.selectedCountries || ['Brasil']

      const hasChanged =
        currentCountries.length !== updatedCountries.length ||
        !currentCountries.every(
          country => updatedCountries.includes(country)
        )

      if (hasChanged) {
        const updatedProfile = {
          ...userProfile,
          selectedCountries: updatedCountries,
        }

        setUserProfile(updatedProfile)

        localStorage.setItem(
          '@app_session',
          JSON.stringify(updatedProfile)
        )

        // Salva os países no Supabase
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session?.user?.id) {
            const { error } = await supabase
              .from('profiles')
              .update({
                selected_countries: updatedCountries,
                updated_at: new Date().toISOString(),
              })
              .eq('id', session.user.id)

            if (error) {
              console.error(
                'Erro ao atualizar países do perfil:',
                error
              )
            }
          }
        } catch (error) {
          console.error(
            'Erro ao salvar países do perfil:',
            error
          )
        }
      }
    }

    // ============================================================
    // 7. SALVA AS MOEDAS NO SUPABASE
    // ============================================================
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user?.id

      if (!userId) {
        console.error('Usuário não autenticado.')
        return
      }

      const { error } = await supabase
        .from('user_coins')
        .upsert({
          user_id: userId,
          coins: updatedCoins,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error(
          'Erro ao salvar moedas:',
          error
        )
      }
    } catch (error) {
      console.error(
        'Erro ao atualizar moedas:',
        error
      )
    }
  },
  [userProfile]
)

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
  setIsEnteringApp(true)
  setActiveTab('home')
  setTabHistory(['home'])
  setShowLanding(false)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user?.id

    if (!userId) {
      throw new Error('Sessão não encontrada após o login.')
    }

    const [
      { data: profileData, error: profileError },
      { data: coinsData, error: coinsError },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select(
          'name, email, avatar, instagram, selected_countries',
        )
        .eq('id', userId)
        .maybeSingle(),

      supabase
        .from('user_coins')
        .select('coins')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    if (profileError) {
      throw profileError
    }

    if (coinsError) {
      throw coinsError
    }

    const completeProfile: UserProfile = {
      name:
        profileData?.name ||
        profile.name ||
        session.user.user_metadata?.full_name ||
        'Colecionador',
      email:
        profileData?.email ||
        session.user.email ||
        profile.email,
      avatar:
        profileData?.avatar ||
        profile.avatar ||
        '/avatars/avatar-01.png',
      instagram:
        profileData?.instagram ||
        profile.instagram ||
        '',
      selectedCountries:
        Array.isArray(profileData?.selected_countries) &&
        profileData.selected_countries.length > 0
          ? profileData.selected_countries
          : profile.selectedCountries?.length
            ? profile.selectedCountries
            : ['Brasil'],
    }

    setUserProfile(completeProfile)
    localStorage.setItem(
      '@app_session',
      JSON.stringify(completeProfile),
    )

    if (coinsData?.coins) {
      setUserCoins(coinsData.coins)
      userCoinsRef.current = coinsData.coins
    } else {
      await supabase
        .from('user_coins')
        .insert({
          user_id: userId,
          coins: {},
        })

      setUserCoins({})
      userCoinsRef.current = {}
    }
  } catch (error) {
    console.error('Erro ao carregar a conta:', error)
    setUserProfile(profile)
    setUserCoins({})
  } finally {
    setIsLoggedIn(true)
    setIsEnteringApp(false)
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
    setShowAuthScreen(false)
    setUserProfile(null)
    setUserCoins({})
    setIsEditingProfile(false)
    setActiveTab('home')
    setTabHistory(['home'])
    setShowLanding(true)
  }, [])

  // Logout automático após 30 minutos sem atividade,
// aplicado somente à versão web para desktop.
useEffect(() => {
  if (!isDesktop || !isLoggedIn) {
    return
  }

  const inactivityLimit = 30 * 60 * 1000
  const storageKey = '@pataca_last_activity'

  let logoutTimer: number | undefined

  const scheduleLogout = () => {
    if (logoutTimer) {
      window.clearTimeout(logoutTimer)
    }

    const savedActivity = Number(localStorage.getItem(storageKey))
    const lastActivity = Number.isFinite(savedActivity)
      ? savedActivity
      : Date.now()

    const elapsedTime = Date.now() - lastActivity
    const remainingTime = inactivityLimit - elapsedTime

    if (remainingTime <= 0) {
      void handleLogout()
      return
    }

    logoutTimer = window.setTimeout(() => {
      void handleLogout()
    }, remainingTime)
  }

  const registerActivity = () => {
    localStorage.setItem(storageKey, String(Date.now()))
    scheduleLogout()
  }

  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, String(Date.now()))
  }

  scheduleLogout()

  const activityEvents = ['pointerdown', 'keydown'] as const

  activityEvents.forEach(eventName => {
    window.addEventListener(eventName, registerActivity)
  })

  return () => {
    if (logoutTimer) {
      window.clearTimeout(logoutTimer)
    }

    activityEvents.forEach(eventName => {
      window.removeEventListener(eventName, registerActivity)
    })
  }
}, [isDesktop, isLoggedIn, handleLogout])

const handleReorderCountries = useCallback(
  async (countries: string[]) => {
    if (!userProfile) return

    const updatedProfile = {
      ...userProfile,
      selectedCountries: countries,
    }

    // Atualiza imediatamente na interface
    setUserProfile(updatedProfile)

    // Atualiza o localStorage
    localStorage.setItem(
      '@app_session',
      JSON.stringify(updatedProfile)
    )

    // Salva a nova ordem no Supabase
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.id) {
        console.error('Usuário não autenticado.')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          selected_countries: countries,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (error) {
        console.error(
          'Erro ao salvar ordem dos países:',
          error
        )
      }
    } catch (error) {
      console.error(
        'Erro ao reorganizar países:',
        error
      )
    }
  },
  [userProfile]
)

const adminEmail = (
  import.meta.env.VITE_ADMIN_EMAIL || ''
)
  .trim()
  .toLowerCase()

const canManageCoinImages =
  adminEmail.length > 0 &&
  userProfile?.email?.trim().toLowerCase() === adminEmail

  // 10. Telas do App (declaradas antes de qualquer return)
  const screens: Record<Tab, React.ReactNode> = {
    home: <HomeScreen  isDesktop={isDesktop} userCoins={userCoins} userProfile={userProfile} onTabChange={handleTabChange} onCoinClick={handleOpenCoinDetail} />,
    catalog: <CatalogScreen userCoins={userCoins} onCoinClick={handleOpenCoinDetail} onUpdateStatus={handleUpdateStatus} />,
    collection: <CollectionScreen onReorderCountries={handleReorderCountries} userCoins={userCoins} userProfile={userProfile} onCoinClick={handleOpenCoinDetail} />,
    stats: <RankingScreen userCoins={userCoins} userProfile={userProfile} />,
    profile: showCoinImageUploader ? (
  <CoinImageUploader
    onBack={() => setShowCoinImageUploader(false)}
     />
     ) : showExportPage ? (
  <ExportPage
    userCollection={userCoins}
    onBack={() => setShowExportPage(false)}
  />
) : isEditingProfile ? (
  <EditProfileScreen
    profile={userProfile}
    userProfile={userProfile}
    userCoins={userCoins}
    onSave={handleSaveProfile}
    onCancel={() => setIsEditingProfile(false)}
  />
) : (
  <ProfileScreen
    isDesktop={isDesktop}
    userCoins={userCoins}
    userProfile={userProfile}
    onLogout={handleLogout}
        onEditProfile={() => setIsEditingProfile(true)}
    onUpdateAvatar={(avatarSrc: string) => {
      if (userProfile) {
        void handleSaveProfile({
          ...userProfile,
          avatar: avatarSrc,
        })
      }
    }}
    onExport={() => setShowExportPage(true)}
    
    onManageCoinImages={
    canManageCoinImages
    ? () => setShowCoinImageUploader(true)
    : undefined
}
  />
    ),
  }

  // 11. Travas de tela (no final de tudo, antes do JSX principal)
// 1. Carregando
if (isEnteringApp) {
  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        background: '#0c0c0e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <style>
        {`
@keyframes coinMove {
  0% {
    transform:
      translateY(0px)
      rotate(-4deg)
      scale(1);
  }

  25% {
    transform:
      translateY(-10px)
      rotate(2deg)
      scale(1.03);
  }

  50% {
    transform:
      translateY(-16px)
      rotate(5deg)
      scale(1.06);
  }

  75% {
    transform:
      translateY(-10px)
      rotate(-2deg)
      scale(1.03);
  }

  100% {
    transform:
      translateY(0px)
      rotate(-4deg)
      scale(1);
  }
}

          @keyframes loadingProgress {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(350%);
            }
          }

          @keyframes coinGlow {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.9);
            }

            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }
        `}
      </style>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ÁREA DA MOEDA */}
        <div
          style={{
            width: 180,
            height: 180,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* BRILHO */}
          <div
            style={{
              position: 'absolute',
              width: 145,
              height: 145,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(212,175,55,0.40) 0%, rgba(212,175,55,0.10) 45%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'coinGlow 2s ease-in-out infinite',
            }}
          />

          {/* MOEDA */}
          <img
            src="/pataca-loading.png"
            alt="Pataca"
            style={{
              width: 145,
              height: 145,
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              animation: 'coinMove 2.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* NOME */}
        <h1
          style={{
            margin: '8px 0 0',
            fontFamily: "'Roboto Slab', serif",
            fontSize: 34,
            fontWeight: 700,
            color: '#D4AF37',
          }}
        >
          Pataca
        </h1>

        <p
          style={{
            margin: '8px 0 22px',
            fontSize: 13,
            color: '#8e8e93',
          }}
        >
          Carregando seu acervo...
        </p>

        {/* BARRA DE CARREGAMENTO */}
        <div
          style={{
            width: '100%',
            maxWidth: 300,
            height: 7,
            borderRadius: 10,
            background: '#2c2c2e',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '35%',
              height: '100%',
              borderRadius: 10,
              background:
                'linear-gradient(90deg, #9A7410, #D4AF37, #FFE082)',
              animation: 'loadingProgress 1.4s ease-in-out infinite',
            }}
          />
        </div>
      </div>
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

if (showLanding) {
  return (
    <PatacaLanding
      onLogin={() => setShowLanding(false)}
      onAuthenticated={handleLoginSuccess}
    />
  )
}

// 3. Não logado
if (!isLoggedIn) {
  if (showAuthScreen) {
    return (
      <AuthScreen
        onLogin={handleLoginSuccess}
        onBack={() => setShowLanding(true)}
      />
    )
  }

  return (
    <PatacaLanding
      onLogin={() => setShowAuthScreen(true)}
      onAuthenticated={handleLoginSuccess}
    />
  )
}
  if (isDesktop) {
  return (
    <DesktopLayout
      userProfile={userProfile}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isExportActive={showExportPage}
    >
      {screens[activeTab]}

      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          userCoin={userCoins[selectedCoin.id]}
          onClose={() => setSelectedCoin(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </DesktopLayout>
  )
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
    


<div
  style={{
    flex: 1,
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }}
>
   
{!isDesktop && (
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
            background:
              'linear-gradient(135deg, rgb(163, 157, 137), rgb(78, 75, 67))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/logo.png"
            alt="Ícone Pataca"
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>

        <span
          style={{
            fontFamily: "'Roboto Slab', serif",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          Pataca
        </span>
      </div>
    )}
  </div>
)}


{/* Conteúdo */}
<div
  style={{
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: isDesktop
      ? '36px 40px 48px'
      : '20px 20px 12px',
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: isDesktop ? 1120 : '100%',
      margin: '0 auto',
    }}
  >
    {screens[activeTab]}
  </div>
</div>

      {/* Menu Inferior */}

  <BottomNav
    active={activeTab}
    onChange={handleTabChange}
  />

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


    </div>
  </div>
)
}
