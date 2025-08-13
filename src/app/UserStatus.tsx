'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function UserStatus() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
    return (
      <div className="flex space-x-2">
        <Link 
          href="/login" 
          className="inline-block transform hover:scale-110 transition-transform duration-200 text-white bg-red-500 px-3 py-2"
        >
          登录
        </Link>
        <Link 
          href="/register" 
          className="inline-block transform hover:scale-110 transition-transform duration-200 text-white bg-red-500 px-3 py-2"
        >
          注册
        </Link>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="flex items-center space-x-2">
      <p className="text-blue-500 font-bold bg-gray-200 px-2 py-1 rounded">用户：{user.email}</p>
      <button
        onClick={handleLogout}
        className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
      >
        登出
      </button>
    </div>
  )
}
