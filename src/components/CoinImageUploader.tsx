import { ChangeEvent, useEffect, useState } from 'react'
import { processCoinImage } from '../lib/processCoinImage'
import {
  CoinImageSide,
  uploadCoinImage,
} from '../lib/coinImageStorage'

type CoinOption = {
  id: string | number
  name: string
}

type CoinImageUploaderProps = {
  coins: CoinOption[]
}

export default function CoinImageUploader({
  coins,
}: CoinImageUploaderProps) {
  const [coinId, setCoinId] = useState('')
  const [side, setSide] = useState<CoinImageSide>('front')
  const [processedImage, setProcessedImage] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      setIsProcessing(true)
      setMessage('')

      const image = await processCoinImage(file)
      const newPreviewUrl = URL.createObjectURL(image)

      setProcessedImage(image)
      setPreviewUrl(newPreviewUrl)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível processar a imagem.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleUpload() {
    if (!coinId) {
      setMessage('Selecione uma moeda.')
      return
    }

    if (!processedImage) {
      setMessage('Selecione uma imagem.')
      return
    }

    try {
      setIsUploading(true)
      setMessage('')

      await uploadCoinImage({
        coinId,
        side,
        image: processedImage,
      })

      setMessage('Imagem salva com sucesso no Supabase.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a imagem.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-xl font-bold text-white">
        Imagens das moedas
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Selecione a moeda, escolha o lado e envie a fotografia.
      </p>

      <label className="mt-6 block text-sm text-zinc-300">
        Moeda
      </label>

      <select
        value={coinId}
        onChange={(event) => setCoinId(event.target.value)}
        className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white"
      >
        <option value="">Selecione uma moeda</option>

        {coins.map((coin) => (
          <option key={coin.id} value={String(coin.id)}>
            {coin.name}
          </option>
        ))}
      </select>

      <div className="mt-5">
        <span className="text-sm text-zinc-300">Lado da moeda</span>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide('front')}
            className={`cursor-pointer rounded-xl border px-4 py-3 ${
              side === 'front'
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-white/10 text-zinc-300'
            }`}
          >
            Frente
          </button>

          <button
            type="button"
            onClick={() => setSide('back')}
            className={`cursor-pointer rounded-xl border px-4 py-3 ${
              side === 'back'
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-white/10 text-zinc-300'
            }`}
          >
            Verso
          </button>
        </div>
      </div>

      <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-white/20 p-5 text-center text-sm text-zinc-300 hover:border-amber-400">
        {isProcessing ? 'Processando imagem...' : 'Escolher imagem'}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {previewUrl && (
        <div className="mt-5 flex justify-center">
          <img
            src={previewUrl}
            alt="Prévia da moeda"
            className="h-48 w-48 rounded-full object-cover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={isUploading || isProcessing}
        className="mt-5 w-full cursor-pointer rounded-xl bg-amber-400 px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? 'Salvando...' : 'Salvar no Supabase'}
      </button>

      {message && (
        <p className="mt-4 text-sm text-zinc-300">{message}</p>
      )}
    </section>
  )
}