'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

interface Building {
  id: string
  name: string
  park_id: string
  building_type: string
  total_floors: number
  total_area: number
  description: string
  status: string
  created_at: string
}

interface Floor {
  id: string
  name: string
  building_id: string
  floor_number: number
  floor_area: number
  rentable_area: number
  ceiling_height: number
  facilities: string[]
  status: string
  created_at: string
}

interface Park {
  id: string
  name: string
}

export default function BuildingDetailPage() {
  const [building, setBuilding] = useState<Building | null>(null)
  const [park, setPark] = useState<Park | null>(null)
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // 添加楼层表单状态
  const [showAddFloor, setShowAddFloor] = useState(false)
  const [floorForm, setFloorForm] = useState({
    name: '',
    floor_number: 1,
    floor_area: 0,
    rentable_area: 0,
    ceiling_height: 3.0,
    facilitiesInput: ''
  })
  
  const router = useRouter()
  const params = useParams()
  const buildingId = params.id as string

  useEffect(() => {
    fetchBuildingData()
    fetchFloors()
  }, [buildingId])

  const fetchBuildingData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // 获取大楼信息和关联的园区信息
      const { data: buildingData, error: buildingError } = await supabase
        .from('buildings')
        .select(`
          *,
          address!buildings_park_id_fkey (
            id,
            name
          )
        `)
        .eq('id', buildingId)
        .single()

      if (buildingError) {
        console.error('获取大楼数据失败:', buildingError)
        setMessage('大楼不存在或无访问权限')
        setTimeout(() => router.push('/task'), 2000)
        return
      }

      setBuilding(buildingData)
      setPark(buildingData.address)
    } catch (error) {
      console.error('获取大楼数据错误:', error)
      setMessage('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchFloors = async () => {
    try {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('building_id', buildingId)
        .order('floor_number', { ascending: true })

      if (error) {
        console.error('获取楼层列表失败:', error)
      } else {
        setFloors(data || [])
      }
    } catch (error) {
      console.error('获取楼层列表错误:', error)
    }
  }

  const generateFloorName = (floorNumber: number) => {
    if (floorNumber > 0) {
      return `${floorNumber}F`
    } else if (floorNumber < 0) {
      return `B${Math.abs(floorNumber)}`
    }
    return '0F'
  }

  const handleAddFloor = async () => {
    if (!floorForm.name.trim()) {
      setMessage('请输入楼层名称')
      return
    }

    // 检查楼层编号是否重复
    const existingFloor = floors.find(f => f.floor_number === floorForm.floor_number)
    if (existingFloor) {
      setMessage(`楼层编号 ${floorForm.floor_number} 已存在`)
      return
    }

    try {
      const facilitiesArray = floorForm.facilitiesInput
        ? floorForm.facilitiesInput.split(',').map(f => f.trim()).filter(f => f)
        : []

      const { error } = await supabase
        .from('floors')
        .insert({
          name: floorForm.name.trim(),
          building_id: buildingId,
          floor_number: floorForm.floor_number,
          floor_area: floorForm.floor_area,
          rentable_area: floorForm.rentable_area,
          ceiling_height: floorForm.ceiling_height,
          facilities: facilitiesArray
        })

      if (error) {
        console.error('添加楼层失败:', error)
        setMessage(`添加失败: ${error.message}`)
      } else {
        setMessage('楼层添加成功！')
        setFloorForm({
          name: '',
          floor_number: 1,
          floor_area: 0,
          rentable_area: 0,
          ceiling_height: 3.0,
          facilitiesInput: ''
        })
        setShowAddFloor(false)
        await fetchFloors()
      }
    } catch (error) {
      console.error('添加楼层错误:', error)
      setMessage('添加失败，请重试')
    }
  }

  const handleDeleteFloor = async (floorId: string, floorName: string) => {
    if (!confirm(`确定要删除楼层 "${floorName}" 吗？这将同时删除该楼层下的所有房间！`)) return

    try {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', floorId)

      if (error) {
        console.error('删除楼层失败:', error)
        setMessage(`删除失败: ${error.message}`)
      } else {
        setMessage('楼层删除成功！')
        await fetchFloors()
      }
    } catch (error) {
      console.error('删除楼层错误:', error)
      setMessage('删除失败，请重试')
    }
  }

  // 关闭消息提示
  const closeMessage = () => {
    setMessage('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">加载大楼信息中...</div>
        </div>
      </div>
    )
  }

  if (!building || !park) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">大楼不存在</h3>
          <p className="text-gray-600 mb-4">该大楼可能已被删除或您没有访问权限</p>
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
        
        {/* 面包屑导航 */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/task')}
            className="hover:text-gray-900 transition-colors"
          >
            园区列表
          </button>
          <span>›</span>
          <button
            onClick={() => router.push(`/park/${park.id}`)}
            className="hover:text-gray-900 transition-colors"
          >
            {park.name}
          </button>
          <span>›</span>
          <span className="text-gray-900 font-medium">{building.name}</span>
        </nav>

        {/* 页面头部 */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
            <p className="text-gray-600 mt-1">{building.building_type} • {park.name}</p>
          </div>
          
          <button
            onClick={() => setShowAddFloor(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
          >
            <span className="mr-1">+</span>
            添加楼层
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 左侧：大楼信息卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">大楼信息</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">大楼名称</label>
                  <p className="text-lg font-semibold text-gray-900">{building.name}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">建筑类型</label>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {building.building_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">总楼层数</label>
                    <p className="text-2xl font-bold text-blue-600">{building.total_floors}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">已创建楼层</label>
                    <p className="text-2xl font-bold text-green-600">{floors.length}</p>
                  </div>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">总面积</label>
                  <p className="text-gray-900 font-medium">{building.total_area} ㎡</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    building.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {building.status === 'active' ? '运营中' : '维护中'}
                  </span>
                </div>

                {building.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">描述</label>
                    <p className="text-gray-700 text-sm leading-relaxed">{building.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：楼层列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">楼层列表</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    共 {floors.length} 个楼层
                  </span>
                </div>
              </div>

              {floors.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {floors.map((floor) => (
                    <div key={floor.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 
                              className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                              onClick={() => router.push(`/floor/${floor.id}`)}
                            >
                              {floor.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {floor.floor_number > 0 ? `${floor.floor_number}层` : `地下${Math.abs(floor.floor_number)}层`}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              floor.status === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : floor.status === 'occupied'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {floor.status === 'available' ? '可用' : floor.status === 'occupied' ? '已占用' : '维护中'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium text-gray-700">楼层面积:</span> 
                              <span className="ml-1">{floor.floor_area} ㎡</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">可租面积:</span> 
                              <span className="ml-1">{floor.rentable_area} ㎡</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">层高:</span> 
                              <span className="ml-1">{floor.ceiling_height} m</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">设施:</span>
                              <span className="ml-1">
                                {floor.facilities && floor.facilities.length > 0 
                                  ? floor.facilities.slice(0, 2).join(', ') + (floor.facilities.length > 2 ? '...' : '')
                                  : '无'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/floor/${floor.id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                          >
                            管理房间
                          </button>
                          <button
                            onClick={() => handleDeleteFloor(floor.id, floor.name)}
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
                  <div className="text-6xl mb-4 opacity-30">🏢</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">还没有楼层</h4>
                  <p className="text-gray-500 mb-6">点击上方"添加楼层"按钮添加您的第一个楼层</p>
                  <button
                    onClick={() => setShowAddFloor(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                  >
                    <span className="mr-2">+</span>
                    添加楼层
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加楼层弹窗 */}
      {showAddFloor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">添加新楼层</h3>
                <button
                  onClick={() => setShowAddFloor(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">关闭</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAddFloor(); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      楼层编号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={floorForm.floor_number}
                      onChange={(e) => {
                        const num = parseInt(e.target.value) || 1
                        setFloorForm({
                          ...floorForm, 
                          floor_number: num,
                          name: generateFloorName(num)
                        })
                      }}
                      placeholder="1表示1层，-1表示地下1层"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">正数为地上层，负数为地下层</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      楼层名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={floorForm.name}
                      onChange={(e) => setFloorForm({...floorForm, name: e.target.value})}
                      placeholder="如：1F, 2F, B1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">楼层面积(㎡)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={floorForm.floor_area}
                      onChange={(e) => setFloorForm({...floorForm, floor_area: parseFloat(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">可租面积(㎡)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={floorForm.rentable_area}
                      onChange={(e) => setFloorForm({...floorForm, rentable_area: parseFloat(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">层高(米)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={floorForm.ceiling_height}
                    onChange={(e) => setFloorForm({...floorForm, ceiling_height: parseFloat(e.target.value) || 3.0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">设施（用逗号分隔）</label>
                  <input
                    type="text"
                    value={floorForm.facilitiesInput}
                    onChange={(e) => setFloorForm({...floorForm, facilitiesInput: e.target.value})}
                    placeholder="如：电梯,消防设施,中央空调"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">多个设施请用逗号分隔</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddFloor(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    <span className="mr-1">+</span>
                    添加楼层
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          message.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span>{message}</span>
          <button
            onClick={closeMessage}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}