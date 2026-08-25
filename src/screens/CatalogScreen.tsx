import React, { useState, useMemo } from 'react'
import { ALL_COINS } from '../data/coins' // Ajuste o caminho conforme o seu projeto
import { UserCoin, Coin, CoinStatus } from '../types' // Ajuste o caminho dos tipos
import CoinCard from '../components/CoinCard' // Ajuste o caminho do CoinCard se necessário
import { CoinDetailModal } from '../components/CoinDetailModal'
import { MONETARY_PLANS } from '../data/constants'


interface CatalogScreenProps {
  userCoins: Record<string, UserCoin>
  onCoinClick: (coin: Coin) => void
onUpdateStatus: (
  coinId: string,
  status: CoinStatus | null,
  quantity?: number,
  country?: string
) => void
}

export function CatalogScreen({
  userCoins,
  onCoinClick,
  onUpdateStatus,
}: CatalogScreenProps) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('Todos')

  // Estados dos Filtros Avançados
  const [showFilters, setShowFilters] = useState(false)
  const [countryFilter, setCountryFilter] = useState('Todos')
  const [materialFilter, setMaterialFilter] = useState('Todos')
  const [yearFilter, setYearFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')

  // Extrai listas de opções sem duplicatas e sem valores nulos
  const countries = useMemo(() => ['Todos', ...Array.from(new Set(ALL_COINS.map(c => c.country).filter(Boolean))).sort()], [])
  const materials = useMemo(() => ['Todos', ...Array.from(new Set(ALL_COINS.map(c => c.material).filter(Boolean))).sort()], [])
  const years = useMemo(() => ['Todos', ...Array.from(new Set(ALL_COINS.map(c => c.year?.toString()).filter(Boolean))).sort((a, b) => Number(b) - Number(a))], [])

  const hasActiveAdvancedFilters = planFilter !== 'Todos' || countryFilter !== 'Todos' || materialFilter !== 'Todos' || yearFilter !== 'Todos' || statusFilter !== 'Todos'

  const handleClearAdvancedFilters = () => {
    setPlanFilter('Todos')
    setCountryFilter('Todos')
    setMaterialFilter('Todos')
    setYearFilter('Todos')
    setStatusFilter('Todos')
  }

  const filtered = useMemo(() => {
    // Normaliza o termo pesquisado (caixa baixa + remove acentos)
    const normalize = (str: any) =>
      String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

    const term = normalize(search)

    // Se a busca estiver vazia E nenhum filtro avançado estiver aplicado, não mostra nada
    if (!term && !hasActiveAdvancedFilters) {
      return []
    }

    return ALL_COINS.filter(c => {
      // 1. Filtro de Plano Monetário
      if (planFilter !== 'Todos' && (c.monetaryPlan || '') !== planFilter) return false

      // 2. Filtro de País
      if (countryFilter !== 'Todos' && (c.country || '') !== countryFilter) return false

      // 3. Filtro de Material
      if (materialFilter !== 'Todos' && (c.material || '') !== materialFilter) return false

      // 4. Filtro de Ano
      if (yearFilter !== 'Todos' && (c.year?.toString() || '') !== yearFilter) return false

      // 5. Filtro de Status na Coleção
      const uCoin = userCoins ? userCoins[c.id] : undefined
      const currentStatus = uCoin ? uCoin.status : null

      if (statusFilter === 'owned' && currentStatus !== 'owned') return false
      if (statusFilter === 'wanted' && currentStatus !== 'wanted') return false
      if (statusFilter === 'missing' && (currentStatus === 'owned' || currentStatus === 'wanted')) return false

      // Se não digitou busca textual, mas ativou algum filtro avançado acima, exibe os resultados dos filtros
      if (!term) return true

      // 6. Busca por texto estrita campo por campo
      const nameMatch = normalize(c.name).includes(term)
      const countryMatch = normalize(c.country).includes(term)
      const planMatch = normalize(c.monetaryPlan).includes(term)
      const materialMatch = normalize(c.material).includes(term)
      const yearMatch = normalize(c.year).includes(term)
      const faceValueMatch = normalize(c.faceValue).includes(term)

      return nameMatch || countryMatch || planMatch || materialMatch || yearMatch || faceValueMatch
    })
  }, [search, planFilter, countryFilter, materialFilter, yearFilter, statusFilter, userCoins, hasActiveAdvancedFilters])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--foreground, #ffffff)' }}>
          Catálogo Geral
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground, #8e8e93)' }}>
          {filtered.length} {filtered.length === 1 ? 'moeda exibida' : 'moedas exibidas'}
        </p>
      </div>

      {/* Busca + Botão Filtros */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--card, #1c1c1e)',
            border: '1px solid var(--border, #2c2c2e)',
            borderRadius: 12,
            padding: '10px 14px',
            flex: 1,
          }}
        >
          <span style={{ opacity: 0.4, fontSize: 16 }}>🔎</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nome, ano, valor, país, material..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              color: 'var(--foreground, #ffffff)',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground, #8e8e93)', fontSize: 16 }}
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 14px',
            borderRadius: 12,
            border: `1px solid ${hasActiveAdvancedFilters || showFilters ? '#4DA3FF' : 'var(--border, #2c2c2e)'}`,
            background: hasActiveAdvancedFilters || showFilters ? '#4DA3FF22' : 'var(--card, #1c1c1e)',
            color: hasActiveAdvancedFilters || showFilters ? '#4DA3FF' : 'var(--foreground, #ffffff)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            height: '42px',
          }}
        >
          ⚙️ Filtros {hasActiveAdvancedFilters && '•'}
        </button>
      </div>

      {/* Painel Expansível de Filtros */}
      {showFilters && (
        <div
          style={{
            background: 'var(--card, #1c1c1e)',
            border: '1px solid var(--border, #2c2c2e)',
            borderRadius: 16,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8e93', marginBottom: 4 }}>Plano Monetário</label>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 8, background: '#2c2c2e', border: 'none', color: '#fff', fontSize: 12 }}
            >
              {MONETARY_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8e93', marginBottom: 4 }}>País</label>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 8, background: '#2c2c2e', border: 'none', color: '#fff', fontSize: 12 }}
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8e93', marginBottom: 4 }}>Ano</label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 8, background: '#2c2c2e', border: 'none', color: '#fff', fontSize: 12 }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8e93', marginBottom: 4 }}>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 8, background: '#2c2c2e', border: 'none', color: '#fff', fontSize: 12 }}
            >
              <option value="Todos">Todos</option>
              <option value="owned">Tenho</option>
              <option value="wanted">Buscando</option>
              <option value="missing">Faltando</option>
            </select>
          </div>

          {hasActiveAdvancedFilters && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={handleClearAdvancedFilters}
                style={{ background: 'none', border: 'none', color: '#EF5350', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--card, #1c1c1e)',
            borderRadius: 16,
            border: '1px solid var(--border, #2c2c2e)',
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>🔍</span>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
            {search || hasActiveAdvancedFilters ? 'Nenhuma moeda encontrada' : 'Busque no catálogo'}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
            {search || hasActiveAdvancedFilters
              ? 'Tente ajustar os termos de pesquisa ou filtros.'
              : 'Digite o nome, ano, valor ou selecione os filtros para exibir as moedas.'}
          </p>
        </div>
      )}

      {/* Grid de Moedas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {filtered.map(coin => {
          const currentStatus = userCoins[coin.id]?.status

          const handleQuickToggle = () => {
            if (!currentStatus) {
              onUpdateStatus(coin.id, 'owned')
            } else if (currentStatus === 'owned') {
              onUpdateStatus(coin.id, 'wanted')
            } else {
              onUpdateStatus(coin.id, null)
            }
          }

          return (
            <CoinCard
              key={coin.id}
              coin={coin}
              userCoin={userCoins[coin.id]}
              onClick={() => onCoinClick(coin)}
              onQuickToggleStatus={handleQuickToggle}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CatalogScreen