'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function UserStatus() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setTempName(data.user.user_metadata?.name || '')
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setTempName(session.user.user_metadata?.name || '')
      } else {
        setTempName('')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSaveName = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: tempName.trim() 
        }
      })

      if (error) {
        console.error('更新姓名失败:', error)
        alert('更新失败，请重试')
      } else {
        setIsEditing(false)
        console.log('姓名更新成功')
        // 重新获取用户信息以更新显示
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      }
    } catch (error) {
      console.error('更新姓名错误:', error)
      alert('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setTempName(user.user_metadata?.name || '')
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex space-x-2">
        <Link 
          href="/login" 
          className="inline-block transform hover:scale-110 transition-transform duration-200 text-white bg-red-500 px-3 py-2 rounded"
        >
          登录
        </Link>
        <Link 
          href="/register" 
          className="inline-block transform hover:scale-110 transition-transform duration-200 text-white bg-red-500 px-3 py-2 rounded"
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

  // 决定显示什么：name 或 email
  const getUserDisplayText = () => {
    const userName = user.user_metadata?.name
    if (userName && userName.trim()) {
      return userName
    }
    return user.email
  }

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        // 编辑模式
        <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="输入姓名"
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
            disabled={loading}
          />
          <button
            onClick={handleSaveName}
            disabled={loading}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={loading}
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        // 显示模式
        <div className="flex items-center space-x-1">
          <p className="text-blue-500 font-bold bg-gray-200 px-2 py-1 rounded">
            用户：{getUserDisplayText()}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            title={user.user_metadata?.name ? '编辑名称' : '设置账号名称'}
          >
            {user.user_metadata?.name ? '编辑' : '设置账号名称'}
          </button>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
      >
        登出
      </button>

      {/* 管理员链接 */}
      {user?.user_metadata?.role === 'admin' && (
        <Link
          href="/admin/config"
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
        >
          网站配置
        </Link>
      )}
    </div>
  )
}
