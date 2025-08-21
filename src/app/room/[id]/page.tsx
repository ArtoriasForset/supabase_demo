'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

interface Room {
  id: string
  room_number: string
  room_type: string
  area: number
  rent_price: number
  sale_price: number
  status: string
  is_available: boolean
  floors: {
    id: string
    name: string
    buildings: {
      id: string
      name: string
      address: { id: string; name: string }
    }
  }
}

interface Contract {
  id: string
  contract_number: string
  tenant_name: string
  tenant_phone: string
  contract_type: string
  status: string
  start_date: string
  end_date: string
  monthly_rent: number
  sale_price: number
  created_at: string
}

export default function RoomDetailPage() {
  const [room, setRoom] = useState<Room | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // 添加合同表单状态
  const [showAddContract, setShowAddContract] = useState(false)
  const [contractForm, setContractForm] = useState({
    contract_type: 'rent',
    tenant_name: '',
    tenant_phone: '',
    start_date: '',
    end_date: '',
    monthly_rent: 0,
    sale_price: 0
  })
  
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  useEffect(() => {
    fetchRoomData()
    fetchContracts()
  }, [roomId])

  const fetchRoomData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          floors:floor_id (
            id,
            name,
            buildings:building_id (
              id,
              name,
              address:park_id (id, name)
            )
          )
        `)
        .eq('id', roomId)
        .single()

      if (error) {
        setMessage('房间不存在或无访问权限')
        setTimeout(() => router.push('/task'), 2000)
        return
      }

      setRoom(data)
      setContractForm(prev => ({
        ...prev,
        monthly_rent: data.rent_price,
        sale_price: data.sale_price
      }))

    } catch (error) {
      setMessage('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })

      if (!error) {
        setContracts(data || [])
      }
    } catch (error) {
      console.error('获取合同列表错误:', error)
    }
  }

  const generateContractNumber = (): string => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = String(date.getTime()).slice(-4)
    return `${contractForm.contract_type.toUpperCase()}-${dateStr}-${timeStr}`
  }

  const handleAddContract = async () => {
    if (!contractForm.tenant_name.trim()) {
      setMessage('请输入租户姓名')
      return
    }

    if (contractForm.contract_type === 'rent' && (!contractForm.start_date || !contractForm.end_date)) {
      setMessage('请选择租赁日期')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('contracts')
        .insert({
          contract_number: generateContractNumber(),
          room_id: roomId,
          tenant_name: contractForm.tenant_name.trim(),
          tenant_phone: contractForm.tenant_phone.trim() || null,
          contract_type: contractForm.contract_type,
          status: 'active',
          start_date: contractForm.start_date || null,
          end_date: contractForm.end_date || null,
          monthly_rent: contractForm.monthly_rent,
          sale_price: contractForm.sale_price,
          created_by: user.id
        })

      if (error) {
        setMessage(`添加失败: ${error.message}`)
      } else {
        setMessage('合同添加成功！')
        setContractForm({
          contract_type: 'rent',
          tenant_name: '',
          tenant_phone: '',
          start_date: '',
          end_date: '',
          monthly_rent: room?.rent_price || 0,
          sale_price: room?.sale_price || 0
        })
        setShowAddContract(false)
        await fetchContracts()
        
        // 更新房间状态
        const newStatus = contractForm.contract_type === 'rent' ? 'rented' : 'sold'
        await supabase.from('rooms').update({ status: newStatus }).eq('id', roomId)
        await fetchRoomData()
      }
    } catch (error) {
      setMessage('添加失败，请重试')
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">房间不存在</h3>
          <button
            onClick={() => router.push('/task')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            返回园区列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* 面包屑导航 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/task')} className="hover:text-gray-900">
            园区列表
          </button>
          <span>›</span>
          <button onClick={() => router.push(`/park/${room.floors.buildings.address.id}`)} className="hover:text-gray-900">
            {room.floors.buildings.address.name}
          </button>
          <span>›</span>
          <button onClick={() => router.push(`/building/${room.floors.buildings.id}`)} className="hover:text-gray-900">
            {room.floors.buildings.name}
          </button>
          <span>›</span>
          <button onClick={() => router.push(`/floor/${room.floors.id}`)} className="hover:text-gray-900">
            {room.floors.name}
          </button>
          <span>›</span>
          <span className="text-gray-900 font-medium">房间 {room.room_number}</span>
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">房间 {room.room_number}</h1>
            <p className="text-gray-600">
              {room.floors.name} • {room.floors.buildings.name} • {room.floors.buildings.address.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </span>
            {room.status === 'vacant' && (
              <button
                onClick={() => setShowAddContract(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                添加合同
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左侧：房间信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">房间信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">房间号:</span>
                  <span className="font-medium">{room.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">类型:</span>
                  <span className="font-medium">{room.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">面积:</span>
                  <span className="font-medium">{room.area} ㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">月租金:</span>
                  <span className="font-medium text-green-600">¥{room.rent_price}</span>
                </div>
                {room.sale_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">售价:</span>
                    <span className="font-medium text-blue-600">¥{room.sale_price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">状态:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：合同列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">合同列表</h2>
                  <span className="text-sm text-gray-500">共 {contracts.length} 个合同</span>
                </div>
              </div>

              {contracts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{contract.contract_number}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {contract.contract_type === 'rent' ? '租赁' : '购买'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contract.status)}`}>
                              {contract.status === 'active' ? '生效' : '草稿'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">租户:</span> {contract.tenant_name}
                            </div>
                            {contract.tenant_phone && (
                              <div>
                                <span className="font-medium">电话:</span> {contract.tenant_phone}
                              </div>
                            )}
                            {contract.contract_type === 'rent' && contract.start_date && (
                              <div>
                                <span className="font-medium">租期:</span>
                                {new Date(contract.start_date).toLocaleDateString()} - 
                                {new Date(contract.end_date).toLocaleDateString()}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">
                                {contract.contract_type === 'rent' ? '月租金:' : '成交价:'}
                              </span>
                              <span className="text-green-600 font-medium">
                                ¥{contract.contract_type === 'rent' ? contract.monthly_rent : contract.sale_price}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            创建时间: {new Date(contract.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 opacity-50">📋</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">还没有合同</h4>
                  {room.status === 'vacant' && (
                    <button
                      onClick={() => setShowAddContract(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      添加合同
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加合同弹窗 */}
      {showAddContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">添加新合同</h3>
            
            <div className="space-y-4">
              {/* 合同类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">合同类型</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="rent"
                      checked={contractForm.contract_type === 'rent'}
                      onChange={(e) => setContractForm({...contractForm, contract_type: e.target.value})}
                      className="mr-2"
                    />
                    租赁合同
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sale"
                      checked={contractForm.contract_type === 'sale'}
                      onChange={(e) => setContractForm({...contractForm, contract_type: e.target.value})}
                      className="mr-2"
                    />
                    销售合同
                  </label>
                </div>
              </div>

              {/* 租户信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">租户姓名 *</label>
                  <input
                    type="text"
                    value={contractForm.tenant_name}
                    onChange={(e) => setContractForm({...contractForm, tenant_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
                  <input
                    type="tel"
                    value={contractForm.tenant_phone}
                    onChange={(e) => setContractForm({...contractForm, tenant_phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 日期 - 仅租赁合同显示 */}
              {contractForm.contract_type === 'rent' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
                    <input
                      type="date"
                      value={contractForm.start_date}
                      onChange={(e) => setContractForm({...contractForm, start_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                    <input
                      type="date"
                      value={contractForm.end_date}
                      onChange={(e) => setContractForm({...contractForm, end_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 金额 */}
              <div className="grid grid-cols-2 gap-4">
                {contractForm.contract_type === 'rent' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">月租金</label>
                    <input
                      type="number"
                      value={contractForm.monthly_rent}
                      onChange={(e) => setContractForm({...contractForm, monthly_rent: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">售价</label>
                    <input
                      type="number"
                      value={contractForm.sale_price}
                      onChange={(e) => setContractForm({...contractForm, sale_price: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddContract(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddContract}
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