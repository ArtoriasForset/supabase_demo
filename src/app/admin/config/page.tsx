'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface WebsiteConfig {
  id: number
  config_key: string
  config_value: string
  description: string
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<WebsiteConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [editingConfig, setEditingConfig] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    fetchConfigs()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      router.push('/login')
      return
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      alert('您没有管理员权限')
      router.push('/')
      return
    }

    setUser(user)
  }

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('website_config')
        .select('*')
        .order('id')

      if (error) throw error

      setConfigs(data || [])
      
      // 初始化编辑状态
      const editState: { [key: string]: string } = {}
      data?.forEach(config => {
        editState[config.config_key] = config.config_value || ''
      })
      setEditingConfig(editState)
      
    } catch (error) {
      console.error('获取配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const config of configs) {
        const newValue = editingConfig[config.config_key]
        if (newValue !== config.config_value) {
          const { error } = await supabase
            .from('website_config')
            .update({ 
              config_value: newValue,
              updated_at: new Date().toISOString()
            })
            .eq('config_key', config.config_key)

          if (error) throw error
        }
      }
      
      alert('配置更新成功！')
      fetchConfigs() // 重新获取最新配置
      
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (configKey: string, value: string) => {
    setEditingConfig(prev => ({
      ...prev,
      [configKey]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">网站配置管理</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              返回首页
            </button>
          </div>

          <div className="space-y-6">
            {configs.map(config => (
              <div key={config.id} className="border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {config.description}
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    配置键: {config.config_key}
                  </div>
                  <input
                    type="text"
                    value={editingConfig[config.config_key] || ''}
                    onChange={(e) => handleInputChange(config.config_key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`请输入${config.description}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={fetchConfigs}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              disabled={saving}
            >
              重置
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}