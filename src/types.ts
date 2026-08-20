export type Tab = 'home' | 'catalog' | 'collection' | 'stats' | 'profile'
export type CoinStatus = 'owned' | 'wanted'

export interface Coin {
  id: string
  name: string
  faceValue: string
  country: string
  year: number
  decade: number | string // Aceita tanto 1990 quanto '2010'
  monetaryPlan: string
  material: string
  diameter: string
  weight: string
  thickness: string
  edge: string
  mint: string
  mintage: string
  commemorative: boolean
  obverseImageUrl?: string
  reverseImageUrl?: string
  obverseDescription?: string
  reverseDescription?: string
  description?: string
  curiosities?: string
}

export interface UserCoin {
  coinId: string
  status: CoinStatus
  favorite: boolean
  quantity: number
  condition?: string
  paidValue?: number
  acquiredAt?: string
  notes?: string
}

export interface UserProfile {
  name: string
  email: string
  instagram?: string
  selectedCollections?: string[]
}