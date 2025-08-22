'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
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

interface UserProfile {
  id: string
  email: string
  role?: string
}

export default function DashboardPage() {
  const [parks, setParks] = useState<ParkData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParks, setFilteredParks] = useState<ParkData[]>([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.2632, lng: 108.9480 })
  const [mapZoom, setMapZoom] = useState(8)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set())
  
  // 添加权限提示弹窗状态
  const [permissionAlert, setPermissionAlert] = useState<{ 
    show: boolean; 
    message: string; 
    parkName: string;
    type: 'no_permission' | 'not_logged_in';
  }>({ 
    show: false, 
    message: '',
    parkName: '',
    type: 'no_permission'
  })
  
  // 添加搜索提示弹窗状态
  const [searchAlert, setSearchAlert] = useState<{ show: boolean; message: string }>({ 
    show: false, 
    message: '' 
  })
  
  const router = useRouter()

  useEffect(() => {
    initializeUser()
  }, [])

  // 初始化用户信息和权限
  const initializeUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('用户未登录')
        setCurrentUser(null)
        setUserPermissions(new Set())
        fetchAllParks() // 仍然获取数据，但限制操作
        return
      }

      setCurrentUser({
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'user'
      })

      // 获取用户权限（可以访问哪些园区）
      await fetchUserPermissions(user.id)
      await fetchAllParks()
      
    } catch (error) {
      console.error('初始化用户信息失败:', error)
      setError('用户权限验证失败')
      fetchAllParks()
    }
  }

  // 获取用户权限
  const fetchUserPermissions = async (userId: string) => {
    try {
      // 获取用户创建的园区
      const { data: userParks, error: userParksError } = await supabase
        .from('address')
        .select('id')
        .eq('user_id', userId)

      if (userParksError) {
        console.error('获取用户园区权限失败:', userParksError)
        return
      }

      const permissions = new Set<string>()
      
      // 添加用户自己创建的园区权限
      if (userParks) {
        userParks.forEach(park => permissions.add(park.id))
      }

      // 如果是管理员，可以访问所有园区
      if (currentUser?.role === 'admin') {
        const { data: allParks } = await supabase
          .from('address')
          .select('id')
        
        if (allParks) {
          allParks.forEach(park => permissions.add(park.id))
        }
      }

      setUserPermissions(permissions)
      console.log(`用户权限设置完成，可访问 ${permissions.size} 个园区`)
      
    } catch (error) {
      console.error('获取用户权限失败:', error)
    }
  }

  // 检查用户是否有权限访问特定园区
  const hasPermissionToAccess = (parkId: string): boolean => {
    // 如果用户未登录，不允许访问
    if (!currentUser) {
      return false
    }

    // 管理员可以访问所有园区
    if (currentUser.role === 'admin') {
      return true
    }

    // 检查是否在用户权限列表中
    return userPermissions.has(parkId)
  }

  // 显示权限提示弹窗
  const showPermissionAlert = (parkName: string, type: 'no_permission' | 'not_logged_in') => {
    let message = ''
    
    if (type === 'not_logged_in') {
      message = `您需要登录后才能查看"${parkName}"的详细信息。登录后您可以创建和管理自己的园区。`
    } else {
      message = `您没有权限查看"${parkName}"的详细信息。您只能查看自己创建的园区信息。`
    }
    
    setPermissionAlert({
      show: true,
      message,
      parkName,
      type
    })
  }

  // 关闭权限提示弹窗
  const closePermissionAlert = () => {
    setPermissionAlert({
      show: false,
      message: '',
      parkName: '',
      type: 'no_permission'
    })
  }

  // 从权限弹窗跳转到登录页面
  const goToLoginFromAlert = () => {
    closePermissionAlert()
    router.push('/login')
  }

  // 从权限弹窗返回主页面（重置视图）
  const backToMainView = () => {
    closePermissionAlert()
    // 重置搜索和视图
    setSearchTerm('')
    setFilteredParks(parks)
    if (parks.length > 0) {
      const centerLat = parks.reduce((sum, park) => sum + park.lat, 0) / parks.length
      const centerLng = parks.reduce((sum, park) => sum + park.lng, 0) / parks.length
      setMapCenter({ lat: centerLat, lng: centerLng })
      setMapZoom(parks.length === 1 ? 12 : parks.length <= 5 ? 8 : 6)
    }
  }

  // 设置全局点击处理函数 - 修改为直接跳转，无提示
  useEffect(() => {
    // 为信息窗口中的按钮设置全局处理函数
    window.parkClickHandler = (parkId: string) => {
      try {
        console.log('信息窗口按钮点击:', parkId)
        
        // 验证parkId
        if (!parkId || typeof parkId !== 'string') {
          console.error('无效的园区ID:', parkId)
          router.push('/dashboard') // 直接跳转回地图
          return
        }

        // 检查园区是否存在
        const park = parks.find(p => p.id === parkId)
        if (!park) {
          console.error('园区不存在:', parkId)
          router.push('/dashboard') // 直接跳转回地图
          return
        }

        console.log('找到园区:', park)

        // 验证用户登录状态 - 未登录直接跳转回地图
        if (!currentUser) {
          console.log('用户未登录，跳转回地图')
          router.push('/dashboard')
          return
        }

        // 检查用户权限 - 无权限直接跳转回地图
        const hasAccess = hasPermissionToAccess(parkId)
        console.log('权限检查结果:', { parkId, hasAccess, userRole: currentUser.role, permissions: Array.from(userPermissions) })
        
        if (!hasAccess) {
          console.log('用户无权限，跳转回地图')
          router.push('/dashboard')
          return
        }

        // 清除错误状态
        setError(null)
        
        console.log('权限验证通过，跳转到园区详情页')
        // 跳转到园区详情页
        router.push(`/park/${parkId}`)
      } catch (error) {
        console.error('信息窗口跳转失败:', error)
        router.push('/dashboard') // 出错也跳转回地图
      }
    }

    // 清理函数
    return () => {
      try {
        if (window.parkClickHandler) {
          delete window.parkClickHandler
        }
      } catch (error) {
        console.warn('清理全局函数失败:', error)
      }
    }
  }, [router, parks, currentUser, userPermissions])

  // 获取所有园区数据 - 增强错误处理
  const fetchAllParks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('address')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取园区数据失败:', error)
        setError('获取园区数据失败，请刷新页面重试')
        return
      }

      if (!data || data.length === 0) {
        console.log('暂无园区数据')
        setParks([])
        setFilteredParks([])
        return
      }

      // 验证数据格式
      const validParks = data.filter(park => {
        if (!park.id || !park.name || typeof park.lat !== 'number' || typeof park.lng !== 'number') {
          console.warn('无效的园区数据:', park)
          return false
        }
        return true
      })

      if (validParks.length !== data.length) {
        console.warn(`过滤了 ${data.length - validParks.length} 条无效数据`)
      }

      setParks(validParks)
      setFilteredParks(validParks)
      
      // 计算所有园区的中心点
      if (validParks.length > 0) {
        const centerLat = validParks.reduce((sum, park) => sum + park.lat, 0) / validParks.length
        const centerLng = validParks.reduce((sum, park) => sum + park.lng, 0) / validParks.length
        
        // 验证坐标有效性
        if (isNaN(centerLat) || isNaN(centerLng)) {
          console.error('计算地图中心点失败')
          setError('地图坐标数据异常')
          return
        }
        
        setMapCenter({ lat: centerLat, lng: centerLng })
        
        // 根据园区数量调整缩放级别
        if (validParks.length === 1) {
          setMapZoom(12)
        } else if (validParks.length <= 5) {
          setMapZoom(8)
        } else {
          setMapZoom(5)
        }
      }
    } catch (error) {
      console.error('获取园区数据错误:', error)
      setError('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  // 搜索功能 - 修改为弹窗提示
  const handleSearch = () => {
    try {
      setError(null)
      setSearchAlert({ show: false, message: '' }) // 清除之前的搜索提示

      if (!searchTerm.trim()) {
        setFilteredParks(parks)
        // 重置到显示所有园区的视图
        if (parks.length > 0) {
          const centerLat = parks.reduce((sum, park) => sum + park.lat, 0) / parks.length
          const centerLng = parks.reduce((sum, park) => sum + park.lng, 0) / parks.length
          setMapCenter({ lat: centerLat, lng: centerLng })
          setMapZoom(parks.length === 1 ? 12 : parks.length <= 5 ? 8 : 6)
        }
        return
      }

      const filtered = parks.filter(park => {
        try {
          return park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (park.address && park.address.toLowerCase().includes(searchTerm.toLowerCase()))
        } catch (error) {
          console.warn('搜索过滤时出错:', error, park)
          return false
        }
      })
      
      setFilteredParks(filtered)
      
      // 如果没有搜索结果，显示弹窗提示
      if (filtered.length === 0) {
        setSearchAlert({ 
          show: true, 
          message: `没有找到包含 "${searchTerm}" 的园区信息，请尝试其他关键词` 
        })
        // 保持当前地图视图不变
        return
      }
      
      // 根据搜索结果调整地图视图
      const centerLat = filtered.reduce((sum, park) => sum + park.lat, 0) / filtered.length
      const centerLng = filtered.reduce((sum, park) => sum + park.lng, 0) / filtered.length
      
      if (!isNaN(centerLat) && !isNaN(centerLng)) {
        setMapCenter({ lat: centerLat, lng: centerLng })
        setMapZoom(filtered.length === 1 ? 18 : filtered.length <= 5 ? 10 : 8)
      }
    } catch (error) {
      console.error('搜索功能出错:', error)
      setError('搜索功能异常，请重新尝试')
    }
  }

  // 关闭搜索提示弹窗
  const closeSearchAlert = () => {
    setSearchAlert({ show: false, message: '' })
    // 关闭弹窗后直接返回主页面，显示所有园区
    setSearchTerm('')
    setFilteredParks(parks)
    // 重置到显示所有园区的视图
    if (parks.length > 0) {
      const centerLat = parks.reduce((sum, park) => sum + park.lat, 0) / parks.length
      const centerLng = parks.reduce((sum, park) => sum + park.lng, 0) / parks.length
      setMapCenter({ lat: centerLat, lng: centerLng })
      setMapZoom(parks.length === 1 ? 12 : parks.length <= 5 ? 8 : 6)
    }
  }

  // 处理地图标记点击事件 - 修改为直接跳转，无提示
  const handleMarkerClick = (marker: any) => {
    try {
      console.log('标记点击事件:', marker)
      setError(null)
      
      // 验证marker数据
      if (!marker || !marker.id) {
        console.warn('标记数据无效:', marker)
        router.push('/dashboard') // 直接跳转回地图
        return
      }

      // 验证园区是否存在
      const park = filteredParks.find(p => p.id === marker.id)
      if (!park) {
        console.warn('找不到对应的园区:', marker.id)
        router.push('/dashboard') // 直接跳转回地图
        return
      }

      // 验证用户登录状态 - 未登录直接跳转回地图
      if (!currentUser) {
        console.log('用户未登录，跳转回地图')
        router.push('/dashboard')
        return
      }

      // 检查用户权限 - 无权限直接跳转回地图
      if (!hasPermissionToAccess(marker.id)) {
        console.log('用户无权限，跳转回地图')
        router.push('/dashboard')
        return
      }

      // 验证园区数据完整性
      if (!park.name) {
        console.warn('园区名称缺失:', park)
        router.push('/dashboard') // 直接跳转回地图
        return
      }

      console.log('跳转到园区页面:', park.id)
      
      // 直接跳转到园区详情页面
      router.push(`/park/${park.id}`)
    } catch (error) {
      console.error('处理标记点击失败:', error)
      router.push('/dashboard') // 出错也跳转回地图
    }
  }

  // 清除错误信息
  const clearError = () => {
    setError(null)
  }

  // 重试加载数据
  const retryLoad = () => {
    setError(null)
    initializeUser()
  }

  // 跳转到登录页面
  const goToLogin = () => {
    router.push('/login')
  }

  // 转换园区数据为地图标记格式 - 增加权限标识
  const mapMarkers = filteredParks.map(park => {
    try {
      const hasAccess = hasPermissionToAccess(park.id)
      
      return {
        lat: park.lat,
        lng: park.lng,
        title: park.name || '未命名园区',
        description: park.address || '无地址信息',
        label: park.name ? (park.name.length > 8 ? park.name.substring(0, 8) + '...' : park.name) : '园区',
        id: park.id,
        hasAccess: hasAccess // 添加权限标识
      }
    } catch (error) {
      console.warn('转换园区数据失败:', error, park)
      return {
        lat: park.lat || 0,
        lng: park.lng || 0,
        title: '数据异常',
        description: '园区数据异常',
        label: '异常',
        id: park.id || 'unknown',
        hasAccess: false
      }
    }
  }).filter(marker => marker.lat !== 0 && marker.lng !== 0) // 过滤无效坐标

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">加载园区信息中...</div>
          <div className="text-sm text-gray-500 mt-2">请稍候，正在获取最新数据</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-100">

      {searchAlert.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="text-yellow-500 text-2xl mr-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900">搜索结果</h3>
            </div>
            <p className="text-gray-700 mb-6">{searchAlert.message}</p>
            <div className="flex justify-end">
              <button
                onClick={closeSearchAlert}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                type="button"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户状态提示 */}
      {!currentUser && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="text-blue-400 mr-3">ℹ️</div>
              <div>
                <p className="text-sm text-blue-800 font-medium">访客模式</p>
                <p className="text-sm text-blue-700">您当前以访客身份浏览，登录后可查看园区详细信息和创建自己的园区。</p>
              </div>
            </div>
            <button
              onClick={goToLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="button"
            >
              立即登录
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <p className="text-sm text-red-800 font-medium">系统提示</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={retryLoad}
                className="text-red-800 hover:text-red-900 text-sm font-medium focus:outline-none"
                type="button"
              >
                重试
              </button>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-700 text-sm focus:outline-none"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 顶部搜索区域 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                园区地图
                {currentUser && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({currentUser.email})
                    {currentUser.role === 'admin' && <span className="ml-1 text-red-500">[管理员]</span>}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {currentUser 
                  ? `查看园区位置分布，您可以访问 ${userPermissions.size} 个园区`
                  : '查看园区位置分布，登录后可查看详细信息'
                }
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
                  className="w-full pl-4 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  disabled={loading}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                type="button"
              >
                搜索
              </button>
            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              显示 <span className="font-semibold text-red-600">{filteredParks.length}</span> 个园区
              {currentUser && (
                <span className="ml-2 text-green-600">
                  (可访问: {mapMarkers.filter(m => m.hasAccess).length})
                </span>
              )}
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

      {/* 地图区域 */}
      <div className="p-4 z-0">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {mapMarkers.length > 0 ? (
            <TencentMap
              center={mapCenter}
              zoom={mapZoom}
              markers={mapMarkers}
              styleId='1'
              onMarkerClick={handleMarkerClick}
              className="w-full h-[70vh] z-0"
            />
          ) : (
            <div className="w-full h-[70vh] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无地图数据</h3>
                <p className="text-gray-600">没有有效的园区坐标数据可显示</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 空状态 */}
      {filteredParks.length === 0 && !loading && !error && (
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
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                type="button"
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

// 扩展 Window 接口以支持全局点击处理函数
declare global {
  interface Window {
    parkClickHandler?: (parkId: string) => void
  }
}