'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/task')
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4 mb-96 mt-32">
      <h1>登录</h1>
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 my-2 w-full"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2 my-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        登录
      </button>
      {error && (
        <>
          <p className="mt-2 text-red-500">{error}</p>
          <p>
            没有账号？{' '}
            <a href="/register" className="text-blue-600 underline">
              去注册
            </a>
          </p>
        </>
      )}
    </form>
  )
}
