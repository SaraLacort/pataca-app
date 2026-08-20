import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient' // Ajuste o caminho da instância do Supabase
import { UserProfile } from '../types' // Ajuste o caminho dos tipos

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Esqueci minha senha no Supabase
  const handleForgotPassword = async () => {
    if (!email) {
      alert('Por favor, digite seu e-mail no campo antes de clicar em "Esqueci minha senha".')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      alert('E-mail de redefinição enviado! Verifique sua caixa de entrada e o spam.')
    } catch (err: any) {
      console.error('Erro ao enviar e-mail:', err)
      alert('Erro ao enviar e-mail: ' + (err.message || 'Verifique se o e-mail está correto.'))
    }
  }

  // 2. Submissão do formulário (Login ou Cadastro no Supabase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const lowerEmail = email.toLowerCase().trim()

    if (mode === 'register') {
      if (!name.trim()) {
        alert('Por favor, digite seu nome completo.')
        setLoading(false)
        return
      }

      // Cadastra usuário no Supabase e grava o Nome no metadata do perfil
      const { data, error } = await supabase.auth.signUp({
        email: lowerEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      })

      if (error) {
        alert('Erro ao cadastrar: ' + error.message)
        setLoading(false)
        return
      }

      const userName = data.user?.user_metadata?.full_name || name.trim()
      const userProfile = { name: userName, email: lowerEmail }

      alert('Conta criada com sucesso!')
      onLogin(userProfile)
    } else {
      // Login via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lowerEmail,
        password: password,
      })

      if (error) {
        alert('E-mail ou senha incorretos.')
        setLoading(false)
        return
      }

      // Recupera o nome salvo do metadata do Supabase (ou usa parte do email se não tiver)
      const userName = data.user?.user_metadata?.full_name || lowerEmail.split('@')[0]
      const userProfile = { name: userName, email: lowerEmail }

      onLogin(userProfile)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px 20px',
        background: '#0c0c0e',
        color: '#ffffff',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0e0d0d, #8B6914)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            margin: '0 auto 16px',
            
          }}
        >
            <img src="/logo.png" alt="Ícone Pataca" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover'  }} 
      />

        </div>
        <h1 style={{ fontFamily: "'Roboto Slab', serif", fontSize: 40, fontWeight: 700, margin: '0 0 6px' }}>
          Pataca
        </h1>
        <p style={{ margin: 0, fontSize: 20, color: '#b0b0be' }}>
          {mode === 'login' ? 'Sua Coleção na palma da mão' : 'Crie sua conta para começar'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          background: '#1c1c1e',
          border: '1px solid #2c2c2e',
          borderRadius: 20,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box',
        }}
      >
        {mode === 'register' && (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Carlos Silva"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                background: '#2c2c2e',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#2c2c2e',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6 }}>
            Senha
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#2c2c2e',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 8,
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
            color: '#000',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </button>
      </form>
      

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#8e8e93' }}>
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4DA3FF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            {mode === 'login' ? 'Cadastre-se' : 'Fazer Login'}
          </button>
        </p>
      </div>

      <div style={{ textAlign: 'right', marginTop: '4px', marginBottom: '12px' }}>
  <button
    type="button"
    onClick={handleForgotPassword}
    style={{
      background: 'none',
      border: 'none',
      color: '#007bff', // Ajuste a cor de acordo com o tema do seu app
      fontSize: '13px',
      cursor: 'pointer',
      textDecoration: 'underline'
    }}
  >
    Esqueci minha senha
  </button>
</div>
    </div>
  )
}
export default AuthScreen