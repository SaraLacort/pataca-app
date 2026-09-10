import React, { useState } from 'react'
import { UserCoin, UserProfile } from '../types'
import { ALL_COINS } from '../data/coins'
import AvatarPicker from '../components/AvatarPicker'
import { supabase } from '../lib/supabaseClient'

// Extrai a lista de países disponíveis das moedas cadastradas
const ALL_COUNTRIES = Array.from(
  new Set(
    ALL_COINS.map(coin => (coin as any).country || (coin as any).pais || (coin as any).nation).filter(Boolean)
  )
)

// Normaliza texto para comparação sem acento e minúsculo
const cleanStr = (str: any) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

// Mapeamento de sinônimos/traduções para garantir que "Alemanha", "Germany" e "Deutschland" sejam identificados
const COUNTRY_SYNONYMS: Record<string, string[]> = {
  alemanha: ['alemanha', 'germany', 'deutschland', 'de'],
  brasil: ['brasil', 'brazil', 'br'],
  portugal: ['portugal', 'pt'],
  estadosunidos: ['estados unidos', 'eua', 'usa', 'united states'],
  espanha: ['espanha', 'spain', 'espana', 'es'],
  italia: ['italia', 'italy', 'it'],
  franca: ['franca', 'france', 'fr'],
  reunido: ['reino unido', 'uk', 'united kingdom', 'inglaterra', 'england'],
}

interface EditProfileScreenProps {
  userProfile?: UserProfile | null
  profile?: UserProfile | null
  userCoins?: Record<string, UserCoin> | any
  onSave: (updatedProfile: UserProfile) => void
  onCancel: () => void
  onClose?: () => void
}

export function EditProfileScreen({
  profile,
  userProfile,
  userCoins,
  onSave,
  onCancel,
}: EditProfileScreenProps) {
  const currentProfile = profile || userProfile

  // ESTADOS DO FORMULÁRIO
  const [customAvatar, setCustomAvatar] = useState<string>(
    currentProfile?.avatar || '/avatars/avatar-01.png'
  )
  const [name, setName] = useState(currentProfile?.name || '')
  const [email, setEmail] = useState(currentProfile?.email || '')
  const [password, setPassword] = useState('')
  const [instagram, setInstagram] = useState( currentProfile?.instagram ? `@${currentProfile.instagram.replace(/^@+/, '')}` : '',)
  
  // ESTADOS PARA EXPANDIR / RECOLHER AS SEÇÕES
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [isCountriesOpen, setIsCountriesOpen] = useState(false)

  // ESTADO DOS PAÍSES SELECIONADOS
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    if (currentProfile?.selectedCountries && currentProfile.selectedCountries.length > 0) {
      return currentProfile.selectedCountries
    }
    return ['Brasil']
  })

  // Checagem robusta de posse de moedas
  const checkIfUserHasCoinsInCountry = (targetCountry: string): boolean => {
    const cleanTarget = cleanStr(targetCountry).replace(/\s+/g, '')
    const validCountryNames = COUNTRY_SYNONYMS[cleanTarget] || [cleanStr(targetCountry)]

    // 1. Encontra todas as moedas no catálogo correspondentes a esse país
    const matchedCoinsInCatalog = ALL_COINS.filter(c => {
      const cCountry = cleanStr((c as any).country || (c as any).pais || (c as any).nation || (c as any).issuer)
      return validCountryNames.some(synonym => cCountry.includes(synonym) || synonym.includes(cCountry))
    })

    const catalogIds = new Set(
      matchedCoinsInCatalog.map(c => String(c.id || (c as any).coinId || (c as any)._id).trim())
    )

    // 2. Coleta dados de todas as fontes possíveis (Props + LocalStorage)
    const allDataSources: any[] = []
    if (userCoins) allDataSources.push(userCoins)

    try {
      const userEmail = cleanStr(currentProfile?.email)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const lowerKey = key.toLowerCase()
          if (lowerKey.includes('coin') || lowerKey.includes('moeda') || (userEmail && lowerKey.includes(userEmail)) || lowerKey.startsWith('@app_')) {
            const item = localStorage.getItem(key)
            if (item) {
              try {
                allDataSources.push(JSON.parse(item))
              } catch (e) {
                // não é JSON
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    // 3. Função recursiva para vasculhar se existe posse
    let found = false

    const inspect = (node: any, parentKey?: string) => {
      if (!node || found) return

      // Se o item contém indicação de país direto no nó
      const nodeCountry = cleanStr(node.country || node.pais || node.nation || node.countryName)
      if (nodeCountry && validCountryNames.some(s => nodeCountry.includes(s))) {
        const isOwned = node.status === 'owned' || node.status === 'Tenho' || node.owned === true || node === 'owned'
        if (isOwned) {
          found = true
          return
        }
      }

      // Se for apenas o ID (número ou string)
      if (typeof node === 'string' || typeof node === 'number') {
        const strId = String(node).trim()
        if (catalogIds.has(strId)) {
          found = true
          return
        }
      }

      // Se for um objeto
      if (typeof node === 'object') {
        const isOwned =
          node.status === 'owned' ||
          node.status === 'Tenho' ||
          node.owned === true ||
          node === 'owned'

        const coinId = String(node.coinId || node.id || node.coin_id || parentKey || '').trim()

        if (isOwned && (catalogIds.has(coinId) || catalogIds.has(String(parentKey || '').trim()))) {
          found = true
          return
        }

        // Continua vasculhando propriedades internas
        for (const [k, v] of Object.entries(node)) {
          inspect(v, k)
        }
      }
    }

    allDataSources.forEach(src => inspect(src))
    return found
  }

  // Alterna a escolha dos países com trava
  const toggleCountry = (country: string) => {
    const isCurrentlySelected = selectedCountries.includes(country)

    if (isCurrentlySelected) {
      const hasCoins = checkIfUserHasCoinsInCountry(country)

      if (hasCoins) {
        alert(
          `Você possui moedas salvas da coleção "${country}". Remova as moedas da sua coleção antes de desativar este país.`
        )
        return
      }
    }

    setSelectedCountries(prev =>
      isCurrentlySelected
        ? prev.filter(c => c !== country)
        : [...prev, country]
    )
  }

const handleInstagramChange = (value: string) => {
  if (!value) {
    setInstagram('')
    return
  }

  const username = value.replace(/^@+/, '')
  setInstagram(`@${username}`)
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
 
    const instagramValue = instagram.trim()

if (
  instagramValue &&
  !/^@[A-Za-z0-9._]{1,30}$/.test(instagramValue)
) {
  alert(
    'O Instagram deve começar com @ e conter apenas letras, números, ponto ou sublinhado.',
  )
  return
}

    const lowerOldEmail = currentProfile?.email?.toLowerCase().trim() || ''
    const lowerNewEmail = email.toLowerCase().trim()
    const usersData = JSON.parse(localStorage.getItem('@app_users') || '{}')

    if (lowerNewEmail !== lowerOldEmail && usersData[lowerNewEmail]) {
      alert('Este e-mail já está em uso por outro perfil.')
      return
    }

    if (selectedCountries.length === 0) {
      alert('Selecione pelo menos um país para a sua coleção.')
      return
    }

    if (password && password.length < 6) {
  alert('A nova senha deve ter pelo menos 6 caracteres.')
  return
}

if (password) {
  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  })

  if (passwordError) {
    alert(`Não foi possível alterar a senha: ${passwordError.message}`)
    return
  }
}

    const updatedProfile: UserProfile = {
      name: name.trim(),
      email: lowerNewEmail,
      avatar: customAvatar,
      instagram: instagramValue.replace(/^@/, ''),
      selectedCountries: selectedCountries,
    }

    if (lowerOldEmail && lowerNewEmail !== lowerOldEmail) {
      const oldKey = `@app_coins_${lowerOldEmail}`
      const newKey = `@app_coins_${lowerNewEmail}`
      const savedCoins = localStorage.getItem(oldKey)
      if (savedCoins) {
        localStorage.setItem(newKey, savedCoins)
        localStorage.removeItem(oldKey)
      }
      delete usersData[lowerOldEmail]
    }

      const localUser = {...usersData[lowerNewEmail],...updatedProfile, }

delete localUser.password

usersData[lowerNewEmail] = localUser

    localStorage.setItem('@app_users', JSON.stringify(usersData))
    localStorage.setItem('@app_session', JSON.stringify(updatedProfile))

    onSave(updatedProfile)
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1
          style={{
            fontFamily: "'Roboto Slab', serif",
            fontSize: 22,
            fontWeight: 700,
            margin: '0 0 4px',
            color: '#ffffff',
          }}
        >
          Editar Perfil
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
          Altere suas informações de cadastro
        </p>
      </div>

      {/* 1. PREVIEW DO AVATAR COM BOTÃO EXPANSÍVEL */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <img
          src={customAvatar}
          alt="Avatar do Perfil"
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            border: '3px solid #D4AF37',
            objectFit: 'cover',
          }}
        />

        <button
          type="button"
          onClick={() => setIsAvatarOpen(prev => !prev)}
          style={{
            background: '#1c1c1e',
            border: '1px solid #2c2c2e',
            color: '#D4AF37',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{isAvatarOpen ? 'Recolher avatares' : 'Trocar avatar'}</span>
          <span>{isAvatarOpen ? '▲' : '▼'}</span>
        </button>

        {isAvatarOpen && (
          <div
            style={{
              width: '100%',
              marginTop: 8,
              padding: 14,
              background: '#1c1c1e',
              borderRadius: 14,
              border: '1px solid #2c2c2e',
            }}
          >
            <AvatarPicker
              selectedAvatar={customAvatar}
              onSelectAvatar={url => {
                setCustomAvatar(url)
              }}
            />
          </div>
        )}
      </div>

      {/*  2. SEÇÃO EXPANSÍVEL DE PAÍSES *
      <div style={{ background: '#1c1c1e', borderRadius: 14, border: '1px solid #2c2c2e', padding: 14 }}>
        <button
          type="button"
          onClick={() => setIsCountriesOpen(prev => !prev)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#ffffff', textAlign: 'left' }}>
              Coleções de Países
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8e8e93', textAlign: 'left' }}>
              {selectedCountries.length}{' '}
              {selectedCountries.length === 1 ? 'país selecionado' : 'países selecionados'}
            </p>
          </div>
          <span style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>
            {isCountriesOpen ? 'Recolher ▲' : 'Ver todos ▼'}
          </span>
        </button>

        {isCountriesOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 14 }}>
            {ALL_COUNTRIES.map(country => {
              const isSelected = selectedCountries.includes(country)
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? '#4DA3FF' : '#2c2c2e'}`,
                    background: isSelected ? 'rgba(77,163,255,0.15)' : '#141414',
                    color: isSelected ? '#4DA3FF' : '#8e8e93',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{country}</span>
                  <span>{isSelected ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div> */}

      {/* 3. DADOS A SEREM EDITADOS */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Nome */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            Nome completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* E-mail */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Senha */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            Nova senha (opcional)
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Deixe vazio para não alterar"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Instagram */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            Instagram
          </label>
          <input
            type="text"
            value={instagram}
            onChange={e => handleInstagramChange(e.target.value)}
            placeholder="@usuario.instagram"
            maxLength={31}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 12,
              border: '1px solid #2c2c2e',
              background: '#1c1c1e',
              color: '#8e8e93',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              color: '#000',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfileScreen