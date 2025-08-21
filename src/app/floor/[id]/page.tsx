'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

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
  buildings: {
    id: string
    name: string
    address: { id: string; name: string }
  }
}

interface Room {
  id: string
  room_number: string
  room_type: string
  area: number
  rent_price: number
  sale_price: number
  status: string
  is_available: boolean
  created_at: string
}

export default function FloorDetailPage() {
  const [floor, setFloor] = useState<Floor | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // 添加房间表单状态
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    room_type: '办公室',
    area: 0,
    rent_price: 0,
    sale_price: 0
  })
  
  const router = useRouter()
  const params = useParams()
  const floorId = params.id as string

  useEffect(() => {
    fetchFloorData()
    fetchRooms()
  }, [floorId])

  const fetchFloorData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('floors')
        .select(`
          *,
          buildings:building_id (
            id,
            name,
            address:park_id (id, name)
          )
        `)
        .eq('id', floorId)
        .single()

      if (error) {
        console.error('获取楼层数据失败:', error)
        setMessage('楼层不存在或无访问权限')
        setTimeout(() => router.push('/task'), 2000)
        return
      }

      setFloor(data)
    } catch (error) {
      console.error('获取楼层数据错误:', error)
      setMessage('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('floor_id', floorId)
        .order('room_number', { ascending: true })

      if (error) {
        console.error('获取房间列表失败:', error)
      } else {
        setRooms(data || [])
      }
    } catch (error) {
      console.error('获取房间列表错误:', error)
    }
  }

  // 生成房间号建议
  const generateRoomNumber = (floorNumber: number) => {
    const existingNumbers = rooms.map(r => r.room_number)
    let suggestedNumber = ''
    
    if (floorNumber > 0) {
      // 地上楼层: 101, 102, 103...
      for (let i = 1; i <= 50; i++) {
        const roomNum = `${floorNumber}${i.toString().padStart(2, '0')}`
        if (!existingNumbers.includes(roomNum)) {
          suggestedNumber = roomNum
          break
        }
      }
    } else {
      // 地下楼层: B101, B102, B103...
      const floorPrefix = `B${Math.abs(floorNumber)}`
      for (let i = 1; i <= 50; i++) {
        const roomNum = `${floorPrefix}${i.toString().padStart(2, '0')}`
        if (!existingNumbers.includes(roomNum)) {
          suggestedNumber = roomNum
          break
        }
      }
    }
    
    return suggestedNumber
  }

  const handleAddRoom = async () => {
    if (!roomForm.room_number.trim()) {
      setMessage('请输入房间号')
      return
    }

    // 验证房间号格式 (101, 102, 201, B101等)
    const roomNumberPattern = /^(B?\d{1,2}\d{2}|\d{3,4}[A-Z]?)$/
    if (!roomNumberPattern.test(roomForm.room_number)) {
      setMessage('房间号格式不正确，应为：101、102、201、B101等格式')
      return
    }

    // 检查房间号是否重复
    const existingRoom = rooms.find(r => r.room_number === roomForm.room_number)
    if (existingRoom) {
      setMessage(`房间号 ${roomForm.room_number} 已存在`)
      return
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .insert({
          room_number: roomForm.room_number.trim(),
          floor_id: floorId,
          room_type: roomForm.room_type,
          area: roomForm.area,
          rent_price: roomForm.rent_price,
          sale_price: roomForm.sale_price,
          status: 'vacant',
          is_available: true
        })

      if (error) {
        console.error('添加房间失败:', error)
        setMessage(`添加失败: ${error.message}`)
      } else {
        setMessage('房间添加成功！')
        setRoomForm({
          room_number: '',
          room_type: '办公室',
          area: 0,
          rent_price: 0,
          sale_price: 0
        })
        setShowAddRoom(false)
        await fetchRooms()
      }
    } catch (error) {
      console.error('添加房间错误:', error)
      setMessage('添加失败，请重试')
    }
  }

  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (!confirm(`确定要删除房间 "${roomNumber}" 吗？这将同时删除该房间的所有合同！`)) return

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) {
        console.error('删除房间失败:', error)
        setMessage(`删除失败: ${error.message}`)
      } else {
        setMessage('房间删除成功！')
        await fetchRooms()
      }
    } catch (error) {
      console.error('删除房间错误:', error)
      setMessage('删除失败，请重试')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'vacant': 'bg-gray-100 text-gray-800',
      'rented': 'bg-green-100 text-green-800',
      'sold': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || colors['vacant']
  }

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'vacant': '空置',
      'rented': '已租',
      'sold': '已售',
      'maintenance': '维护'
    }
    return texts[status] || '空置'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">加载楼层信息中...</div>
        </div>
      </div>
    )
  }

  if (!floor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">楼层不存在</h3>
          <p className="text-gray-600 mb-4">该楼层可能已被删除或您没有访问权限</p>
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
          <button onClick={() => router.push('/task')} className="hover:text-gray-900">
            园区列表
          </button>
          <span>›</span>
          <button onClick={() => router.push(`/park/${floor.buildings.address.id}`)} className="hover:text-gray-900">
            {floor.buildings.address.name}
          </button>
          <span>›</span>
          <button onClick={() => router.push(`/building/${floor.buildings.id}`)} className="hover:text-gray-900">
            {floor.buildings.name}
          </button>
          <span>›</span>
          <span className="text-gray-900 font-medium">{floor.name}</span>
        </nav>

        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{floor.name}</h1>
            <p className="text-gray-600">
              {floor.buildings.name} • {floor.buildings.address.name}
            </p>
          </div>
          
          <button
            onClick={() => {
              setRoomForm({
                ...roomForm,
                room_number: generateRoomNumber(floor.floor_number)
              })
              setShowAddRoom(true)
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            添加房间
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 左侧：楼层信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">楼层信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">楼层名称</label>
                  <p className="text-lg font-semibold text-gray-900">{floor.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">楼层编号</label>
                  <p className="text-gray-800">
                    {floor.floor_number > 0 ? `${floor.floor_number}层` : `地下${Math.abs(floor.floor_number)}层`}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">房间数量</label>
                  <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">楼层面积</label>
                  <p className="text-gray-800">{floor.floor_area} ㎡</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">可租面积</label>
                  <p className="text-gray-800">{floor.rentable_area} ㎡</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">层高</label>
                  <p className="text-gray-800">{floor.ceiling_height} m</p>
                </div>
                
                {floor.facilities && floor.facilities.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">设施</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {floor.facilities.map((facility, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：房间列表 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">房间列表</h2>
                  <span className="text-sm text-gray-500">共 {rooms.length} 个房间</span>
                </div>
              </div>

              {rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {rooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 
                          className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                          onClick={() => router.push(`/room/${room.id}`)}
                        >
                          {room.room_number}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>类型:</span>
                          <span className="font-medium">{room.room_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>面积:</span>
                          <span className="font-medium">{room.area} ㎡</span>
                        </div>
                        <div className="flex justify-between">
                          <span>月租金:</span>
                          <span className="font-medium text-green-600">¥{room.rent_price}</span>
                        </div>
                        {room.sale_price > 0 && (
                          <div className="flex justify-between">
                            <span>售价:</span>
                            <span className="font-medium text-blue-600">¥{room.sale_price}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => router.push(`/room/${room.id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                        >
                          管理
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id, room.room_number)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 opacity-50">🏠</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">还没有房间</h4>
                  <p className="text-gray-500 mb-4">点击上方"添加房间"按钮添加您的第一个房间</p>
                  <button
                    onClick={() => {
                      setRoomForm({
                        ...roomForm,
                        room_number: generateRoomNumber(floor.floor_number)
                      })
                      setShowAddRoom(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    添加房间
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加房间弹窗 */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">添加新房间</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房间号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomForm.room_number}
                  onChange={(e) => setRoomForm({...roomForm, room_number: e.target.value})}
                  placeholder="如：101、102、201、B101"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">格式：101、102、201、B101等</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">房间类型</label>
                  <select
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm({...roomForm, room_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="办公室">办公室</option>
                    <option value="会议室">会议室</option>
                    <option value="仓库">仓库</option>
                    <option value="商铺">商铺</option>
                    <option value="工作室">工作室</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">面积(㎡)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomForm.area}
                    onChange={(e) => setRoomForm({...roomForm, area: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月租金(元)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomForm.rent_price}
                    onChange={(e) => setRoomForm({...roomForm, rent_price: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">售价(元)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomForm.sale_price}
                    onChange={(e) => setRoomForm({...roomForm, sale_price: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRoom(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddRoom}
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