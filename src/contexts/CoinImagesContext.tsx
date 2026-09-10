import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'

type CoinImageRecord = {
  coin_id: string
  front_path: string | null
  back_path: string | null
  updated_at: string
}

type CoinImageUrls = {
  front?: string
  back?: string
}

type CoinImagesContextValue = {
  images: Record<string, CoinImageUrls>
  refreshCoinImages: () => Promise<void>
}

const CoinImagesContext = createContext<CoinImagesContextValue | null>(null)

function getPublicUrl(path: string, updatedAt: string) {
  const { data } = supabase.storage
    .from('coin-images')
    .getPublicUrl(path)

  return `${data.publicUrl}?v=${encodeURIComponent(updatedAt)}`
}

export function CoinImagesProvider({
  children,
}: {
  children: ReactNode
}) {
  const [images, setImages] = useState<Record<string, CoinImageUrls>>({})

  const refreshCoinImages = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setImages({})
      return
    }

    const { data, error } = await supabase
      .from('coin_images')
      .select('coin_id, front_path, back_path, updated_at')

    if (error) {
      console.error('Erro ao carregar imagens das moedas:', error)
      return
    }

    const imageMap = (data as CoinImageRecord[]).reduce<
      Record<string, CoinImageUrls>
    >((result, item) => {
      result[item.coin_id] = {
        front: item.front_path
          ? getPublicUrl(item.front_path, item.updated_at)
          : undefined,
        back: item.back_path
          ? getPublicUrl(item.back_path, item.updated_at)
          : undefined,
      }

      return result
    }, {})

    setImages(imageMap)
  }, [])

  useEffect(() => {
    void refreshCoinImages()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setImages({})
        return
      }

      window.setTimeout(() => {
        void refreshCoinImages()
      }, 0)
    })

    return () => subscription.unsubscribe()
  }, [refreshCoinImages])

  const value = useMemo(
    () => ({
      images,
      refreshCoinImages,
    }),
    [images, refreshCoinImages],
  )

  return (
    <CoinImagesContext.Provider value={value}>
      {children}
    </CoinImagesContext.Provider>
  )
}

export function useCoinImages() {
  const context = useContext(CoinImagesContext)

  if (!context) {
    throw new Error(
      'useCoinImages deve ser usado dentro de CoinImagesProvider.',
    )
  }

  return context
}