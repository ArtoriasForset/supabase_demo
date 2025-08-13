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
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4 mb-[50vh] mt-[20vh] bg-gray-100 rounded shadow">
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border border-blue-500 p-2 my-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border border-blue-500 p-2 my-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full text-xl hover:bg-blue-500 transition-colors">
        登录
      </button>
      {error && (
        <>
          <p className="mt-2 text-red-500">{error}</p>
          <p>
            登录失败-没有账号？{' '}
            <a href="/register" className="text-blue-600 underline">
              去注册
            </a>
          </p>
        </>
      )}
    </form>
  )
}
