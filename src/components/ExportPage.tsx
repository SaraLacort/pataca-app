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

  quantity:
    isOwned
      ? Math.max(1, Number(c.quantity) || 1)
      : 0,

  status: isOwned ? 'owned' : statusValue
}
})



// ============================================================
// UMA LINHA POR TIPO DE MOEDA
// A quantidade aparece em sua própria coluna
// ============================================================

const coinsArray = normalizedCoins


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
      `"${c.status === 'owned' ? 'Tenho' : 'Buscando'}"`
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
  if (!coinsArray.length) {
    return alert('Sua coleção está vazia!')
  }

  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    return alert('Por favor, permita pop-ups para gerar o PDF.')
  }

  const today = new Date().toLocaleDateString('pt-BR')

  // Quantidade física total de moedas possuídas
  const totalOwnedQuantity = coinsArray.reduce((total, coin) => {
    if (coin.status !== 'owned') {
      return total
    }

    return total + Math.max(1, Number(coin.quantity) || 1)
  }, 0)

  // Quantidade de tipos diferentes possuídos
  const totalOwnedTypes = coinsArray.filter(
    coin => coin.status === 'owned'
  ).length

  const totalWanted = coinsArray.filter(
    coin => coin.status === 'wanted'
  ).length

  const tableRows = coinsArray.map((c, index) => {
    const isOwned = c.status === 'owned'

    return `
      <tr class="${index % 2 === 0 ? 'even' : 'odd'}">

        <td class="country">
          ${c.country || 'Brasil'}
        </td>

        <td class="coin-name">
          ${c.name || 'Moeda'}
        </td>

        <td class="center">
          ${c.year || '-'}
        </td>

        <td>
          ${c.monetaryPlan || '-'}
        </td>

        <td>
          ${c.material || '-'}
        </td>

        <td class="center quantity">
          ${isOwned ? c.quantity : '-'}
        </td>

        <td class="center">
          ${c.stateOfPreservation || '-'}
        </td>

        <td class="center">
          <span class="status ${isOwned ? 'owned' : 'wanted'}">
            ${isOwned ? 'Tenho' : 'Buscando'}
          </span>
        </td>

      </tr>
    `
  }).join('')

  const htmlContent = `
    <!DOCTYPE html>

    <html lang="pt-BR">

    <head>

      <meta charset="UTF-8" />

      <title>Coleção Pataca - Relatório</title>

      <style>

        @page {
          size: A4 landscape;
          margin: 12mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #202124;
          background: #ffffff;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 3px solid #D4AF37;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .brand {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #111111;
        }

        .subtitle {
          color: #666666;
          font-size: 11px;
          margin-top: 4px;
        }

        .date {
          font-size: 11px;
          color: #777777;
          text-align: right;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .summary-card {
          border: 1px solid #dddddd;
          border-radius: 8px;
          padding: 10px 12px;
          background: #fafafa;
        }

        .summary-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #777777;
          margin-bottom: 3px;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
          font-size: 10px;
        }

        thead {
          display: table-header-group;
        }

        tr {
          page-break-inside: avoid;
        }

        th {
          background: #181818;
          color: #ffffff;
          padding: 8px 6px;
          text-align: left;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-right: 1px solid #444444;
        }

        td {
          padding: 7px 6px;
          border-bottom: 1px solid #e6e6e6;
          vertical-align: middle;
        }

        tr.even {
          background: #ffffff;
        }

        tr.odd {
          background: #f8f8f8;
        }

        .coin-name {
          font-weight: 700;
          min-width: 130px;
        }

        .country {
          font-weight: 600;
        }

        .center {
          text-align: center;
        }

        .quantity {
          font-size: 12px;
          font-weight: 800;
        }

        .status {
          display: inline-block;
          padding: 4px 7px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status.owned {
          color: #247a31;
          background: #e5f5e8;
          border: 1px solid #b7dfbd;
        }

        .status.wanted {
          color: #9a6500;
          background: #fff4d6;
          border: 1px solid #ead18a;
        }

        .footer {
          margin-top: 18px;
          padding-top: 8px;
          border-top: 1px solid #dddddd;
          display: flex;
          justify-content: space-between;
          color: #888888;
          font-size: 9px;
        }

      </style>

    </head>

    <body>

      <div class="header">

        <div>
          <div class="brand">PATACA</div>

          <div class="subtitle">
            Relatório do Acervo Numismático
          </div>
        </div>

        <div class="date">
          Gerado em ${today}
        </div>

      </div>

      <div class="summary">

        <div class="summary-card">
          <div class="summary-label">
            Exemplares no acervo
          </div>

          <div class="summary-value">
            ${totalOwnedQuantity}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">
            Moedas diferentes
          </div>

          <div class="summary-value">
            ${totalOwnedTypes}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">
            Buscando
          </div>

          <div class="summary-value">
            ${totalWanted}
          </div>
        </div>

      </div>

      <table>

        <thead>

          <tr>
            <th>País</th>
            <th>Moeda</th>
            <th>Ano</th>
            <th>Plano</th>
            <th>Material</th>
            <th style="text-align:center;">Qtd.</th>
            <th style="text-align:center;">Estado</th>
            <th style="text-align:center;">Status</th>
          </tr>

        </thead>

        <tbody>
          ${tableRows}
        </tbody>

      </table>

      <div class="footer">

        <span>
          Pataca · Seu Acervo Numismático
        </span>

        <span>
          ${totalOwnedQuantity} exemplares · ${totalOwnedTypes} moedas diferentes
        </span>

      </div>

      <script>

        window.onload = function() {
          setTimeout(function() {
            window.print()
          }, 300)
        }

      </script>

    </body>

    </html>
  `

  printWindow.document.open()
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
                {coinsArray.reduce((total, coin) => {
      if (coin.status !== 'owned') return total

      return total + Math.max(1, Number(coin.quantity) || 1)
    }, 0)} moedas no total
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