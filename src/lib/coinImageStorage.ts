import { supabase } from './supabaseClient'

export type CoinImageSide = 'front' | 'back'

type UploadCoinImageParams = {
  coinId: string
  side: CoinImageSide
  image: Blob
}

function sanitizeCoinId(coinId: string) {
  return coinId
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
}

export async function uploadCoinImage({
  coinId,
  side,
  image,
}: UploadCoinImageParams) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Você precisa estar autenticada para enviar imagens.')
  }

  const safeCoinId = sanitizeCoinId(coinId)
  const imagePath = `${safeCoinId}/${side}.webp`

  const { error: uploadError } = await supabase.storage
    .from('coin-images')
    .upload(imagePath, image, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Erro ao enviar imagem: ${uploadError.message}`)
  }

  const { data: currentImage, error: readError } = await supabase
    .from('coin_images')
    .select('front_path, back_path')
    .eq('coin_id', coinId)
    .maybeSingle()

  if (readError) {
    throw new Error(`Erro ao consultar a moeda: ${readError.message}`)
  }

  const paths = {
    front_path: currentImage?.front_path ?? null,
    back_path: currentImage?.back_path ?? null,
  }

  if (side === 'front') {
    paths.front_path = imagePath
  } else {
    paths.back_path = imagePath
  }

  const { error: databaseError } = await supabase
    .from('coin_images')
    .upsert(
      {
        coin_id: coinId,
        ...paths,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      {
        onConflict: 'coin_id',
      },
    )

  if (databaseError) {
    throw new Error(`Erro ao registrar imagem: ${databaseError.message}`)
  }

  const { data } = supabase.storage
    .from('coin-images')
    .getPublicUrl(imagePath)

  return {
    path: imagePath,
    publicUrl: data.publicUrl,
  }
}