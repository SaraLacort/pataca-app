const OUTPUT_SIZE = 800

export async function processCoinImage(file: File): Promise<Blob> {
  const image = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível processar a imagem.')
  }

  const scale = Math.max(
    OUTPUT_SIZE / image.width,
    OUTPUT_SIZE / image.height,
  )

  const width = image.width * scale
  const height = image.height * scale
  const x = (OUTPUT_SIZE - width) / 2
  const y = (OUTPUT_SIZE - height) / 2

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

  context.drawImage(image, x, y, width, height)
  context.restore()

  image.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Não foi possível gerar a imagem processada.'))
        }
      },
      'image/webp',
      0.9,
    )
  })
}