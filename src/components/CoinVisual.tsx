
import React, { useState, useEffect } from 'react'; 

function getShortValue(value?: string | number): string {
  if (!value) return ''
  const str = String(value)
  return str.replace(/Cruzeiros?|Cruzados?|Reais|Real|Centavos?/gi, '').trim()
}

function CoinVisual({ coin, size = 64, userStatus, isMissing, val, side, isReverse, showReverse, flip }: any) {
  const safeCoin = coin || {};
  const [imgError, setImgError] = useState(false);

  // Identifica se estamos visualizando o verso
  const isViewingReverse = 
    side === 'back' ||  
    side === 'reverse' || 
    side === 'reverso' || 
    isReverse === true || 
    showReverse === true || 
    flip === true;

  // Monta o caminho automático baseado no ID da moeda
  const defaultAutoImage = safeCoin.id 
    ? `/coins/${safeCoin.id}${isViewingReverse ? 'b' : 'a'}.png`
    : null;

  // Imagem que tentaremos carregar
  const imageSrc = isViewingReverse 
    ? (safeCoin.reverseImageUrl || safeCoin.reverseImg || defaultAutoImage)
    : (safeCoin.obverseImageUrl || safeCoin.obverseImg || defaultAutoImage);

  // Reseta o erro ao mudar de moeda ou de lado (frente/verso)
  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  // Texto que aparece no centro caso não tenha imagem
  const displayVal = val || safeCoin.faceValue || safeCoin.name || '';

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: size, 
        height: size, 
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          // Fundo cinza neutro com visual metálico elegante
          background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%)',
          border: '1.5px solid #3a3a3c',
          filter: isMissing ? 'grayscale(0.9) brightness(0.55)' : 'none',
          boxShadow: isMissing
            ? 'none'
            : 'inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {imageSrc && !imgError ? (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={safeCoin.name || 'Moeda'}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        ) : (
          <span 
            style={{ 
              fontFamily: "'Roboto Slab', serif",
              fontWeight: 700, 
              fontSize: size * 0.22, 
              color: '#d1d1d6', 
              textAlign: 'center', 
              padding: '0 4px',
              lineHeight: 1.1,
              userSelect: 'none',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            {getShortValue(displayVal)}
          </span>
        )}
      </div>

      {userStatus && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: '50%',
            background: userStatus === 'owned' ? '#4CAF50' : '#FFB300',
            border: '2.5px solid #0C0C0E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.14,
            color: '#fff',
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          {userStatus === 'owned' ? '✓' : '★'}
        </div>
      )}
    </div>
  );
}
export default CoinVisual;