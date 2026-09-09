import { useEffect, useMemo, useState } from 'react'
import { ALL_COINS } from '../data/coins'

type CoinSide = 'front' | 'back'

interface CoinImageUploaderProps {
  onBack: () => void
}

const OUTPUT_SIZE = 1000

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const temporaryUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(temporaryUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(temporaryUrl)
      reject(new Error('Não foi possível abrir esta imagem.'))
    }

    image.src = temporaryUrl
  })
}

export async function createCircularPng(file: File): Promise<Blob> {
  const image = await loadImage(file)

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('O navegador não conseguiu processar a imagem.')
  }

  context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  context.save()

  context.beginPath()

  context.arc(
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE / 2,
    0,
    Math.PI * 2,
  )

  context.clip()

  const scale = Math.max(
    OUTPUT_SIZE / image.naturalWidth,
    OUTPUT_SIZE / image.naturalHeight,
  )

  const finalWidth = image.naturalWidth * scale
  const finalHeight = image.naturalHeight * scale

  const positionX = (OUTPUT_SIZE - finalWidth) / 2
  const positionY = (OUTPUT_SIZE - finalHeight) / 2

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(
    image,
    positionX,
    positionY,
    finalWidth,
    finalHeight,
  )

  context.restore()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Não foi possível gerar o arquivo PNG.'))
        }
      },
      'image/png',
    )
  })
}

export default function CoinImageUploader({
  onBack,
}: CoinImageUploaderProps) {
  const [query, setQuery] = useState('')
  const [coinId, setCoinId] = useState('')
  const [side, setSide] = useState<CoinSide>('front')
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const filteredCoins = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('pt-BR')

    if (!search) {
      return ALL_COINS
    }

    return ALL_COINS.filter(coin => {
      const information = `
        ${coin.country}
        ${coin.name}
        ${coin.year}
        ${coin.id}
      `.toLocaleLowerCase('pt-BR')

      return information.includes(search)
    })
  }, [query])

  const selectedCoin = ALL_COINS.find(coin => coin.id === coinId)

  const outputName = selectedCoin
    ? `${selectedCoin.id}${side === 'front' ? 'a' : 'b'}.png`
    : ''

useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }
}, [previewUrl])

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    setError('Escolha um arquivo de imagem válido.')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    setError('A imagem deve ter no máximo 20 MB.')
    return
  }

  setProcessing(true)
  setError('')
  setSourceFile(file)

  try {
    const processedImage = await createCircularPng(file)
    const newPreviewUrl = URL.createObjectURL(processedImage)
    

    setProcessedBlob(processedImage)
    setPreviewUrl(newPreviewUrl)
  } catch (caughtError) {
    setPreviewUrl('')
    setProcessedBlob(null)

    setError(
      caughtError instanceof Error
        ? caughtError.message
        : 'Erro ao processar a imagem.',
    )
  } finally {
    setProcessing(false)
  }
}

const downloadProcessedImage = () => {
  if (!selectedCoin) {
    setError('Selecione uma moeda antes de baixar.')
    return
  }

  if (!processedBlob) {
    setError('Escolha e processe uma imagem antes de baixar.')
    return
  }

  const downloadUrl = URL.createObjectURL(processedBlob)
  const downloadLink = document.createElement('a')

  downloadLink.href = downloadUrl
  downloadLink.download = outputName

  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl)
  }, 0)
}

  return (
    <main
      style={{
        width: '100%',
        maxWidth: 980,
        margin: '0 auto',
        color: '#f0f0f2',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '10px 14px',
            border: '1px solid #34343a',
            borderRadius: 9,
            background: '#18181c',
            color: '#d4af37',
          }}
        >
          ← Voltar
        </button>

        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>
            Preparar imagem de moeda
          </h1>

          <p style={{ margin: '5px 0 0', color: '#92929f' }}>
            Escolha a moeda e o lado da imagem.
          </p>
        </div>
      </header>

      <section
        style={{
          padding: 24,
          border: '1px solid #2c2c32',
          borderRadius: 12,
          background: '#151519',
        }}
      >
        <label
          htmlFor="coin-search"
          style={{ display: 'block', marginBottom: 8 }}
        >
          Localizar moeda
        </label>

        <input
          id="coin-search"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Digite país, nome, ano ou ID"
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 20,
            border: '1px solid #36363c',
            borderRadius: 8,
            background: '#0e0e11',
            color: '#ffffff',
          }}
        />

        <label
          htmlFor="coin-select"
          style={{ display: 'block', marginBottom: 8 }}
        >
          Moeda encontrada
        </label>

        <select
          id="coin-select"
          value={coinId}
          onChange={event => setCoinId(event.target.value)}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 20,
            border: '1px solid #36363c',
            borderRadius: 8,
            background: '#0e0e11',
            color: '#ffffff',
          }}
        >
          <option value="">
            Selecione uma moeda
          </option>

          {filteredCoins.map(coin => (
            <option key={coin.id} value={coin.id}>
              {coin.country} — {coin.name} — {coin.year} ({coin.id})
            </option>
          ))}
        </select>

        <p>Lado da moeda</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setSide('front')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #d4af37',
              background: side === 'front' ? '#2d2819' : '#1d1d22',
              color: side === 'front' ? '#f1ce66' : '#c9c9d1',
            }}
          >
            Frente — letra a
          </button>

          <button
            type="button"
            onClick={() => setSide('back')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #d4af37',
              background: side === 'back' ? '#2d2819' : '#1d1d22',
              color: side === 'back' ? '#f1ce66' : '#c9c9d1',
            }}
          >
            Verso — letra b
          </button>
        </div>

<div
  style={{
    marginTop: 24,
    padding: 20,
    border: '1px dashed #4a4330',
    borderRadius: 10,
    background: '#101013',
  }}
>
  <label
    htmlFor="coin-image-file"
    style={{
      display: 'block',
      marginBottom: 10,
      fontWeight: 600,
    }}
  >
    Escolher imagem
  </label>

  <input
    id="coin-image-file"
    type="file"
    accept="image/png,image/jpeg,image/webp"
    disabled={processing}
    onChange={event => {
      const file = event.target.files?.[0]

      if (file) {
        void processFile(file)
      }
    }}
  />

  <p
    style={{
      margin: '10px 0 0',
      color: '#858590',
      fontSize: 12,
    }}
  >
    Formatos aceitos: JPG, PNG ou WebP, com até 20 MB.
  </p>

  {sourceFile && (
    <p
      style={{
        margin: '8px 0 0',
        color: '#a8a8b2',
        fontSize: 12,
      }}
    >
      Arquivo selecionado: {sourceFile.name}
    </p>
  )}

  {processing && (
    <p style={{ color: '#d4af37' }}>
      Processando imagem...
    </p>
  )}

  {error && (
    <p
      role="alert"
      style={{ color: '#ff8585' }}
    >
      {error}
    </p>
  )}

  {previewUrl && (
    <div
      style={{
        marginTop: 20,
        textAlign: 'center',
      }}
    >
      <img
        src={previewUrl}
        alt="Prévia circular da moeda"
        style={{
          width: 240,
          height: 240,
          maxWidth: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          border: '1px solid #4f452a',
          background: 'transparent',
        }}
      />
    </div>
    
  )}
</div>
<button
  type="button"
  onClick={downloadProcessedImage}
  disabled={!selectedCoin || !processedBlob || processing}
  style={{
    width: '100%',
    marginTop: 20,
    padding: 14,
    border: 'none',
    borderRadius: 8,
    background:
      !selectedCoin || !processedBlob || processing
        ? '#4a4230'
        : '#d4af37',
    color: '#17130a',
    fontWeight: 800,
    opacity:
      !selectedCoin || !processedBlob || processing
        ? 0.55
        : 1,
  }}
>
  {processing
    ? 'Processando...'
    : outputName
      ? `Baixar ${outputName}`
      : 'Selecione uma moeda'}
</button>
        <p
          style={{
            marginTop: 20,
            color: '#d4af37',
            fontWeight: 700,
          }}
        >
          Nome que será usado: {outputName || 'selecione uma moeda'}
        </p>
      </section>
    </main>
  )
}