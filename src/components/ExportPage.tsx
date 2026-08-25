import React from 'react'
import { ALL_COINS } from '../data/coins' // Ajuste o caminho das moedas conforme seu projeto

interface ExportPageProps {
  userCollection: Array<{
    id: string
    name: string
    year: string | number
    monetaryPlan?: string
    material?: string
    quantity?: number
    stateOfPreservation?: string
    country?: string
    status?: string
  }> | Record<string, any>
  onBack: () => void
}

export function ExportPage({ userCollection, onBack }: ExportPageProps) {
  // Transforma em Array caso venha como Objeto do state
// ============================================================
// PREPARA AS MOEDAS PARA EXPORTAÇÃO
// ============================================================

const rawCoinsArray = Array.isArray(userCollection)
  ? userCollection
  : Object.keys(userCollection || {}).map(id => {
      const coinData = ALL_COINS.find(c => c.id === id)
      const collectionData = userCollection[id] || {}

      return {
        id,
        name: coinData?.name || 'Moeda',
        year: coinData?.year || '',
        monetaryPlan: coinData?.monetaryPlan || '',
        material: coinData?.material || '',
        country: coinData?.country || 'Brasil',
        quantity: Number(collectionData.quantity) || 1,
        stateOfPreservation: collectionData.stateOfPreservation || '-',
        status: collectionData.status
      }
    })


// ============================================================
// NORMALIZA O STATUS
// ============================================================

const normalizedCoins = rawCoinsArray.map(c => {

  const statusValue = String(c.status || '')
    .trim()
    .toLowerCase()

  const isOwned =
    statusValue === 'owned' ||
    statusValue === 'tenho' ||
    statusValue === 'possuo' ||
    statusValue === 'possui' ||
    statusValue === 'possída' ||
    statusValue === 'possuída' ||
    statusValue === 'possuidas' ||
    statusValue === 'possuídas' ||
    statusValue === 'have' ||
    statusValue === 'collected' ||
    statusValue === 'collection'

  return {
    ...c,

    quantity: Math.max(1, Number(c.quantity) || 1),

    // Se o status indicar que a moeda é da coleção,
    // convertemos tudo para o padrão interno "owned".
    status: isOwned ? 'owned' : statusValue
  }
})


// ============================================================
// CRIA UMA LINHA PARA CADA EXEMPLAR
// ============================================================

const coinsArray = normalizedCoins.flatMap(c =>
  Array.from(
    { length: c.quantity },
    (_, index) => ({
      ...c,
      copyNumber: index + 1
    })
  )
)
  // 1. Exportação para CSV / Excel
  const handleCSV = () => {
    if (!coinsArray.length) return alert('Sua coleção está vazia!')

    const headers = ['País', 'Nome', 'Ano', 'Plano Monetário', 'Material', 'Quantidade', 'Conservação', 'Status']

    const rows = coinsArray.map(c => [
      `"${(c.country || 'Brasil').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.year || '',
      `"${(c.monetaryPlan || '').replace(/"/g, '""')}"`,
      `"${(c.material || '-').replace(/"/g, '""')}"`,
      c.quantity || 1,
      `"${(c.stateOfPreservation || '-').replace(/"/g, '""')}"`,
      `"${c.status === 'owned' ? 'Possuída' : 'Buscando'}"`
    ])

    const textContent = 'sep=;\n' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')

    // Converte o texto para bytes em Latin1 / Windows-1252 para o Excel abrir sem aviso e sem distorcer acentos
    const bytes = new Uint8Array(textContent.length)
    for (let i = 0; i < textContent.length; i++) {
      bytes[i] = textContent.charCodeAt(i) & 0xff
    }

    const blob = new Blob([bytes], { type: 'text/csv;charset=windows-1252;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `Colecao_Pataca_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 2. Exportação para PDF (Gera o relatório formatado em janela própria)
  const handlePDF = () => {
    if (!coinsArray.length) return alert('Sua coleção está vazia!')

    const printWindow = window.open('', '_blank')
    if (!printWindow) return alert('Por favor, permita pop-ups para gerar o PDF.')

    const today = new Date().toLocaleDateString('pt-BR')

const tableRows = coinsArray.map(c => `
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">
      ${c.name}
    </td>

    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
      ${c.year}
    </td>

    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
      ${c.monetaryPlan || '-'}
    </td>

    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
      ${c.material || '-'}
    </td>

    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
      ${c.stateOfPreservation || '-'}
    </td>

    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
      ${c.status === 'owned' ? 'Possuída' : 'Buscando'}
    </td>
  </tr>
`).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Coleção Pataca - Relatório</title>
        <style>
          body { font-family: sans-serif; color: #111; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 20px; }
          h1 { margin: 0; font-size: 24px; color: #0c0c0e; }
          .sub { color: #666; font-size: 12px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #0c0c0e; color: #fff; text-align: left; padding: 8px; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PATACA</h1>
            <div class="sub">Relatório do Acervo Numismático · Gerado em ${today}</div>
          </div>
          <div><strong>Total: ${coinsArray.length} moedas</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano</th>
              <th>Plano Monetário</th>
              <th>Material</th>
              <th>Estado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          Pataca - Seu Acervo Numismático
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#0c0c0e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          width: '100%',
          maxWidth: 480,
          background: '#0c0c0e',
          color: '#ffffff',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Top bar FIXA no topo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 20px 10px',
            borderBottom: '1px solid #2c2c2e',
            flexShrink: 0,
            background: 'rgba(12,12,14,0.96)',
            zIndex: 10,
          }}
        >
          <button 
            onClick={onBack} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4DA3FF', 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
           ← Voltar
          </button>
        </div>

        {/* Corpo com ROLAGEM INDEPENDENTE */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: 'rgba(212,175,55,0.15)', 
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 28, 
                margin: '0 auto 12px' 
              }}
            >
              📤
            </div>
            <h2 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#ffffff' }}>
              Exportar Coleção
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
              Guarde um backup ou compartilhe seu acervo numismático
            </p>
          </div>

          <div 
            style={{ 
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0d1a30 100%)', 
              borderRadius: 18, 
              padding: '16px 20px', 
              border: '1px solid rgba(77,163,255,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(77,163,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Itens no relatório
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: "'Roboto Slab', serif", fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                {coinsArray.length} {coinsArray.length === 1 ? 'moeda cadastrada' : 'moedas cadastradas'}
              </p>
            </div>
            <img src="/logo.png" alt="Ícone Pataca" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            <div 
              style={{ 
                background: '#1c1c1e', 
                border: '1px solid #2c2c2e', 
                borderRadius: 16, 
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24, background: 'rgba(76,175,80,0.15)', padding: '10px', borderRadius: 12 }}>
                  📊
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#ffffff' }}>Planilha Excel / CSV</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8e8e93' }}>Ideal para abrir no Excel ou Google Planilhas</p>
                </div>
              </div>
              <button 
                onClick={handleCSV} 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: 12, 
                  border: 'none', 
                  background: '#4CAF50', 
                  color: '#ffffff', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: 'pointer' 
                }}
              >
                Baixar Planilha (.csv)
              </button>
            </div>

            <div 
              style={{ 
                background: '#1c1c1e', 
                border: '1px solid #2c2c2e', 
                borderRadius: 16, 
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24, background: 'rgba(77,163,255,0.15)', padding: '10px', borderRadius: 12 }}>
                  📄
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#ffffff' }}>Documento PDF / Impressão</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8e8e93' }}>Gera uma versão pronta para salvar em PDF</p>
                </div>
              </div>
              <button 
                onClick={handlePDF} 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: 12, 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)', 
                  color: '#000000', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: 'pointer' 
                }}
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportPage