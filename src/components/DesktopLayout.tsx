import { useEffect, useRef, type ReactNode } from 'react'
import type { Tab, UserProfile } from '../types'
import '../desktop.css'

const navigation: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Visão geral' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'collection', label: 'Minhas coleções' },
  { id: 'profile', label: 'Meu perfil' },
]

export function DesktopIcon({ name }: { name: Tab | 'export' }) {
  const paths = {
    home: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    catalog: <><path d="M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z" /></>,
    collection: <><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v5c0 2 4 3 7 3M3 11v5c0 2 4 3 7 3M15 6v3" /><ellipse cx="16" cy="13" rx="5" ry="3" /><path d="M11 13v5c0 4 10 4 10 0v-5" /></>,
    stats: <><path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 5 4m7-6h4v2a4 4 0 0 1-5 4M12 12v6m-4 3h8m-7-3h6v3H9Z" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    export: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

interface DesktopLayoutProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  isExportActive: boolean
  userProfile: UserProfile | null
  children: ReactNode
}

export default function DesktopLayout({ activeTab, onTabChange, isExportActive, userProfile, children }: DesktopLayoutProps) {
  const scrollArea = useRef<HTMLElement>(null)
  useEffect(() => { scrollArea.current?.scrollTo(0, 0) }, [activeTab, isExportActive])
  const pageName = isExportActive ? 'Exportar coleção' : navigation.find(item => item.id === activeTab)?.label

return (
  <div
    className="pataca-desktop"
    data-page={isExportActive ? 'export' : activeTab}
  >
    <header className="desktop-header">
      <button
        className="desktop-brand"
        onClick={() => onTabChange('home')}
        aria-label="Pataca, visão geral"
      >
        <img src="/logo.png" alt="" />

        <span>
          Pataca
          <span className="desktop-brand-note">
            Acervo Numismático
          </span>
        </span>
      </button>

      <nav
        className="desktop-navigation"
        aria-label="Menu principal"
      >
        {navigation.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-current={
              activeTab === item.id && !isExportActive
                ? 'page'
                : undefined
            }
          >
            <DesktopIcon name={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <span className="desktop-header-version">
  Pataca v1.0.0
</span>
    </header>

    <div className="desktop-workspace">
      

      <main
        className="desktop-scroll"
        ref={scrollArea}
      >
        <div className="desktop-content">
          {children}
        </div>
      </main>
    </div>
  </div>
)
}
