import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ResetPasswordScreenProps {
  onSuccess: () => void
}

export default function ResetPasswordScreen({ onSuccess }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        alert('Senha atualizada com sucesso!')
        onSuccess()
      }
    } catch (err: any) {
      setErrorMsg('Ocorreu um erro ao atualizar a senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#0c0c0e',
        color: '#ffffff',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#16161a',
          padding: 28,
          borderRadius: 16,
          border: '1px solid #2c2c2e',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Roboto Slab', serif",
              fontSize: 24,
              fontWeight: 700,
              margin: '0 0 8px 0',
              color: '#d4af37',
            }}
          >
            Redefinir Senha
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#8e8e93' }}>
            Digite sua nova senha abaixo para recuperar o acesso.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {errorMsg && (
            <div
              style={{
                background: 'rgba(255, 69, 58, 0.15)',
                border: '1px solid #ff453a',
                color: '#ff453a',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                color: '#8e8e93',
                marginBottom: 6,
              }}
            >
              Nova senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a nova senha"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                background: '#0c0c0e',
                border: '1px solid #2c2c2e',
                color: '#ffffff',
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                color: '#8e8e93',
                marginBottom: 6,
              }}
            >
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                background: '#0c0c0e',
                border: '1px solid #2c2c2e',
                color: '#ffffff',
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: '#4DA3FF',
              border: 'none',
              color: '#000000',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 6,
            }}
          >
            {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}