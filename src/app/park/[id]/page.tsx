'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import TencentMap from '@/components/TencentMap'

interface ParkData {
  id: string
  name: string
  address: string | null
  lat: number
  lng: number
  created_at: string
  user_id: string
}

interface Building {
  id: string
  name: string
  building_type: string
  total_floors: number
  total_area: number
  status: string
  created_at: string
}

export default function ParkDetailPage() {
  const [park, setPark] = useState<ParkData | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // 添加大楼表单状态
  const [showAddBuilding, setShowAddBuilding] = useState(false)
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    building_type: '办公楼',
    total_floors: 1,
    total_area: 0,
    description: ''
  })
  
  const router = useRouter()
  const params = useParams()
  const parkId = params.id as string

  useEffect(() => {
    fetchParkData()
    fetchBuildings()
  }, [parkId])

  const fetchParkData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('address')
        .select('*')
        .eq('id', parkId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('获取园区数据失败:', error)
        setMessage('园区不存在或无访问权限')
        setTimeout(() => router.push('/task'), 2000)
        return
      }

      setPark(data)
    } catch (error) {
      console.error('获取园区数据错误:', error)
      setMessage('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('park_id', parkId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取大楼列表失败:', error)
      } else {
        setBuildings(data || [])
      }
    } catch (error) {
      console.error('获取大楼列表错误:', error)
    }
  }

  const handleAddBuilding = async () => {
    if (!buildingForm.name.trim()) {
      setMessage('请输入大楼名称')
      return
    }

    try {
      const { error } = await supabase
        .from('buildings')
        .insert({
          name: buildingForm.name.trim(),
          park_id: parkId,
          building_type: buildingForm.building_type,
          total_floors: buildingForm.total_floors,
          total_area: buildingForm.total_area,
          description: buildingForm.description.trim() || null
        })

      if (error) {
        console.error('添加大楼失败:', error)
        setMessage(`添加失败: ${error.message}`)
      } else {
        setMessage('大楼添加成功！')
        setBuildingForm({
          name: '',
          building_type: '办公楼',
          total_floors: 1,
          total_area: 0,
          description: ''
        })
        setShowAddBuilding(false)
        await fetchBuildings()
      }
    } catch (error) {
      console.error('添加大楼错误:', error)
      setMessage('添加失败，请重试')
    }
  }

  const handleDeleteBuilding = async (buildingId: string, buildingName: string) => {
    if (!confirm(`确定要删除大楼 "${buildingName}" 吗？这将同时删除该大楼下的所有楼层和房间！`)) return

    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', buildingId)

      if (error) {
        console.error('删除大楼失败:', error)
        setMessage(`删除失败: ${error.message}`)
      } else {
        setMessage('大楼删除成功！')
        await fetchBuildings()
      }
    } catch (error) {
      console.error('删除大楼错误:', error)
      setMessage('删除失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">加载园区信息中...</div>
        </div>
      </div>
    )
  }

  if (!park) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">园区不存在</h3>
          <p className="text-gray-600 mb-4">该园区可能已被删除或您没有访问权限</p>
          <button
            onClick={() => router.push('/task')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            返回园区列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/task')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>返回园区列表</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{park.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddBuilding(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              添加大楼
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 左侧：园区信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">园区信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">园区名称</label>
                  <p className="text-lg font-semibold text-gray-900">{park.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">地址</label>
                  <p className="text-gray-800">{park.address || '暂无地址信息'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">大楼数量</label>
                  <p className="text-2xl font-bold text-blue-600">{buildings.length}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="text-gray-800">
                    {new Date(park.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：大楼列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">大楼列表</h2>
                  <span className="text-sm text-gray-500">共 {buildings.length} 栋大楼</span>
                </div>
              </div>

              {buildings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {buildings.map((building) => (
                    <div key={building.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <h3 
                              className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                              onClick={() => router.push(`/building/${building.id}`)}
                            >
                              {building.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {building.building_type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              building.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {building.status === 'active' ? '运营中' : '维护中'}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">楼层数:</span> {building.total_floors}
                            </div>
                            <div>
                              <span className="font-medium">总面积:</span> {building.total_area}㎡
                            </div>
                            <div>
                              <span className="font-medium">创建时间:</span> 
                              {new Date(building.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/building/${building.id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          >
                            管理
                          </button>
                          <button
                            onClick={() => handleDeleteBuilding(building.id, building.name)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 opacity-50">🏢</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">还没有大楼</h4>
                  <p className="text-gray-500 mb-4">点击上方"添加大楼"按钮添加您的第一栋大楼</p>
                  <button
                    onClick={() => setShowAddBuilding(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    添加大楼
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加大楼弹窗 */}
      {showAddBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加新大楼</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">大楼名称</label>
                <input
                  type="text"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                  placeholder="如：A座办公楼"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">建筑类型</label>
                <select
                  value={buildingForm.building_type}
                  onChange={(e) => setBuildingForm({...buildingForm, building_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="办公楼">办公楼</option>
                  <option value="厂房">厂房</option>
                  <option value="仓库">仓库</option>
                  <option value="商业楼">商业楼</option>
                  <option value="宿舍">宿舍</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">楼层数</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={buildingForm.total_floors}
                    onChange={(e) => setBuildingForm({...buildingForm, total_floors: parseInt(e.target.value) || 1})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">总面积(㎡)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={buildingForm.total_area}
                    onChange={(e) => setBuildingForm({...buildingForm, total_area: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述（可选）</label>
                <textarea
                  value={buildingForm.description}
                  onChange={(e) => setBuildingForm({...buildingForm, description: e.target.value})}
                  placeholder="大楼的详细描述..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddBuilding(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddBuilding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}