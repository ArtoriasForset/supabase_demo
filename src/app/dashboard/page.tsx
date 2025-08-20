'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import TencentMap from '@/components/TencentMap'

interface ParkData {
  id: string
  name: string
  address: string | null
  lat: number
  lng: number
  user_id: string
  created_at: string
}

export default function DashboardPage() {
  const [parks, setParks] = useState<ParkData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParks, setFilteredParks] = useState<ParkData[]>([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.2632, lng: 108.9480 })
  const [mapZoom, setMapZoom] = useState(8)

  useEffect(() => {
    fetchAllParks()
  }, [])

  // 获取所有园区数据
  const fetchAllParks = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('address')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取园区数据失败:', error)
      } else {
        setParks(data || [])
        setFilteredParks(data || [])
        
        // 计算所有园区的中心点
        if (data && data.length > 0) {
          const centerLat = data.reduce((sum, park) => sum + park.lat, 0) / data.length
          const centerLng = data.reduce((sum, park) => sum + park.lng, 0) / data.length
          setMapCenter({ lat: centerLat, lng: centerLng })
          
          // 根据园区数量调整缩放级别
          if (data.length === 1) {
            setMapZoom(6)
          } else if (data.length <= 5) {
            setMapZoom(5)
          }
        }
      }
    } catch (error) {
      console.error('获取园区数据错误:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索功能
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredParks(parks)
      // 重置到显示所有园区的视图
      if (parks.length > 0) {
        const centerLat = parks.reduce((sum, park) => sum + park.lat, 0) / parks.length
        const centerLng = parks.reduce((sum, park) => sum + park.lng, 0) / parks.length
        setMapCenter({ lat: centerLat, lng: centerLng })
        setMapZoom(parks.length === 1 ? 15 : parks.length <= 5 ? 5 : 5)
      }
      return
    }

    const filtered = parks.filter(park => 
      park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (park.address && park.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    setFilteredParks(filtered)
    
    // 根据搜索结果调整地图视图
    if (filtered.length > 0) {
      const centerLat = filtered.reduce((sum, park) => sum + park.lat, 0) / filtered.length
      const centerLng = filtered.reduce((sum, park) => sum + park.lng, 0) / filtered.length
      setMapCenter({ lat: centerLat, lng: centerLng })
      setMapZoom(filtered.length === 1 ? 15 : filtered.length <= 5 ? 10 : 5)
    }
  }

  // 转换园区数据为地图标记格式（带名称显示）
  const mapMarkers = filteredParks.map(park => ({
    lat: park.lat,
    lng: park.lng,
    title: park.name,
    description: park.address || '无地址信息',
    label: park.name // 在标记上方显示园区名称
  }))

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

  return (
    <div className="min-h-full bg-gray-100">
      {/* 顶部搜索区域 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                园区地图
              </h1>
              <p className="text-sm text-gray-600">
                查看所有园区位置分布
              </p>
            </div>
            
            {/* 搜索栏 */}
            <div className="flex items-center space-x-2 max-w-md">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="搜索园区名称或地址..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-4 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                搜索
              </button>
            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              显示 <span className="font-semibold text-blue-600">{filteredParks.length}</span> 个园区
              {searchTerm && (
                <span className="ml-2">
                  (搜索: "{searchTerm}")
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              总计 {parks.length} 个园区
            </div>
          </div>
        </div>
      </div>

      {/* 地图区域 - 占据主要空间 */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <TencentMap
            center={mapCenter}
            zoom={mapZoom}
            styleId='1'
            markers={mapMarkers}
            className="w-full h-[70vh]"
          />
        </div>
      </div>

      {/* 空状态 */}
      {filteredParks.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? '没有找到匹配的园区' : '暂无园区数据'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? '请尝试其他搜索关键词' 
                : '系统中还没有添加任何园区信息'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  handleSearch()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                查看所有园区
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}