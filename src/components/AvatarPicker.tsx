import React from 'react'

const DEFAULT_AVATARS_LIST = [
  { id: 'avatar1', src: '/avatars/avatar-01.png', label: 'Avatar 1' },
  { id: 'avatar2', src: '/avatars/avatar-02.png', label: 'Avatar 2' },
  { id: 'avatar3', src: '/avatars/avatar-03.png', label: 'Avatar 3' },
  { id: 'avatar4', src: '/avatars/avatar-04.png', label: 'Avatar 4' },
  { id: 'avatar5', src: '/avatars/avatar-05.png', label: 'Avatar 5' },
  { id: 'avatar6', src: '/avatars/avatar-06.png', label: 'Avatar 6' },
  { id: 'avatar7', src: '/avatars/avatar-07.png', label: 'Avatar 7' },
  { id: 'avatar8', src: '/avatars/avatar-08.png', label: 'Avatar 8' },
  { id: 'avatar9', src: '/avatars/avatar-09.png', label: 'Avatar 9' },
  { id: 'avatar10', src: '/avatars/avatar-10.png', label: 'Avatar 10' },
]

interface AvatarItem {
  id: string
  src: string
  label?: string
}

interface AvatarPickerProps {
  avatars?: AvatarItem[]
  selectedAvatar: string
  onSelectAvatar: (avatarUrl: string) => void
}

export default function AvatarPicker({
  avatars = DEFAULT_AVATARS_LIST,
  selectedAvatar,
  onSelectAvatar,
}: AvatarPickerProps) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 12, textAlign: 'center' }}>
        Escolha um avatar para o seu perfil:
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          justifyItems: 'center',
        }}
      >
        {avatars.map((item, index) => {
          const isSelected = selectedAvatar === item.src

          return (
            <button
              key={item.id || index}
              type="button"
              onClick={() => onSelectAvatar(item.src)}
              style={{
                background: 'none',
                border: isSelected ? '2px solid #D4AF37' : '2px solid transparent',
                borderRadius: '50%',
                padding: 2,
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src={item.src}
                alt={item.label || `Avatar ${index + 1}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}