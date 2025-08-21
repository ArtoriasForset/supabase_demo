'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import TencentMap from '@/components/TencentMap'

export default function Task() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();
  
  // 添加表单状态
  const [parkName, setParkName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login'); // 用户未登录，跳转登录页
      } else {
        setLoading(false); // 用户已登录
        setUser(user); // 设置用户信息
        console.log('当前用户:', user.id, user.email);
        // 获取用户的地址列表
        fetchUserAddresses(user.id);
      }
    }

    checkUser();

    // 监听登录状态变化
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 获取用户地址列表
  const fetchUserAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('address')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取地址列表失败:', error);
      } else {
        setUserAddresses(data || []);
        console.log('用户地址列表:', data);
      }
    } catch (error) {
      console.error('获取地址列表错误:', error);
    }
  };

  const [clickedCoords, setClickedCoords] = useState<{lat: number, lng: number} | null>(null)
  const [markers, setMarkers] = useState<{lat: number, lng: number}[]>([])

  // 添加地图中心点状态
  const [mapCenter, setMapCenter] = useState({ lat: 34.2632, lng: 108.9480 })
  
  // 添加地图缩放状态
  const [mapZoom, setMapZoom] = useState(5)

  const handleMapClick = (lat: number, lng: number) => {
    setMarkers([{ lat, lng }])
    setClickedCoords({ lat, lng })
    setLat(lat)
    setLng(lng)
    console.log('点击坐标:', lat, lng)
  }

  // 提交到数据库的函数
  const handleSubmit = async () => {
    // 验证必填字段
    if (!parkName.trim()) {
      setMessage('请输入园区名字');
      return;
    }
    
    if (!lat || !lng) {
      setMessage('请先在地图上选择位置');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // 插入数据到 address 表
      const { data, error } = await supabase
        .from('address')
        .insert({
          user_id: user.id,           // 用户ID
          name: parkName.trim(),      // 园区名字
          address: addressText.trim() || null, // 地址（可选）
          lat: lat,                   // 纬度
          lng: lng                    // 经度
        })
        .select(); // 返回插入的数据

      if (error) {
        console.error('数据库错误:', error);
        setMessage(`保存失败: ${error.message}`);
      } else {
        console.log('保存成功:', data);
        setMessage(`园区 "${parkName}" 保存成功！`);
        
        // 清空表单
        setParkName('');
        setAddressText('');
        setLat(undefined);
        setLng(undefined);
        setMarkers([]);
        setClickedCoords(null);
        
        // 刷新地址列表
        await fetchUserAddresses(user.id);
      }
    } catch (error) {
      console.error('提交错误:', error);
      setMessage('保存失败，请重试');
    }

    setSubmitting(false);
  };

  // 删除园区
  const deletePark = async (parkId: string, parkName: string) => {
    if (!confirm(`确定要删除园区 "${parkName}" 吗？`)) return;

    try {
      const { error } = await supabase
        .from('address')
        .delete()
        .eq('id', parkId)
        .eq('user_id', user.id); // 确保只能删除自己的记录

      if (error) {
        console.error('删除失败:', error);
        setMessage(`删除失败: ${error.message}`);
      } else {
        setMessage(`园区 "${parkName}" 删除成功`);
        await fetchUserAddresses(user.id);
      }
    } catch (error) {
      console.error('删除错误:', error);
      setMessage('删除失败，请重试');
    }
  };

  return (
    <div className="z-0 container mx-auto p-4 bg-gray-50 rounded shadow m-4 min-h-screen text-center">
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className='flex gap-6 p-4'>
          
          <div className="w-3/4 h-[50vh]">
            <h1 className="text-2xl mb-6 text-blue-500">点击获得地图精确坐标</h1>
            <TencentMap
              center={mapCenter}
              zoom={mapZoom}  // 使用动态缩放值
              markers={markers}
              onMapClick={handleMapClick}
              allowAddMarker={false}
            />
          </div>

          <div className='w-1/4 flex flex-col items-center space-y-4 py-12'>
            <h1 className="text-4xl mb-4 text-blue-500">添加园区信息</h1>

            <input 
              type="text" 
              placeholder="园区名字" 
              value={parkName}
              onChange={(e) => setParkName(e.target.value)}
              className="border w-80 p-2 rounded border-gray-400 m-4"
              required
            />

            <input 
              type='text' 
              placeholder='地址（可选）' 
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className='p-2 w-80 border border-gray-400 rounded m-4'
            />
            
            {/* 始终显示坐标信息 */}
            <div className="text-xl bg-gray-100 p-2 my-4 rounded w-64 max-w-sm text-yellow-900 transform hover:scale-110 transition">
              <p><strong>当前坐标:</strong></p>
              <p>纬度: {(lat || mapCenter.lat).toFixed(6)}</p>
              <p>经度: {(lng || mapCenter.lng).toFixed(6)}</p>
                <p className="text-sm text-green-600 mt-2">
                  {lat && lng ? '已选择位置' : '默认位置为西安，点击地图获取坐标'}
                </p>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting || !parkName.trim() || !lat || !lng}
              className='px-8 py-2 mt-2 rounded bg-blue-500 text-white text-xl hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              {submitting ? '保存中...' : '添加到数据库'}
            </button>

            {/* 显示已保存的园区数量 */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-lg border border-blue-300">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-blue-800 font-medium">已保存 {userAddresses.length} 个园区</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 园区列表 - 列表样式 */}
      <div className="mx-8 mb-8">
        {user && userAddresses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* 标题区域 */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">我的园区列表</h3>
                <p className="text-gray-500">共 {userAddresses.length} 个园区</p>
              </div>
              
              {/* 统计信息 */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userAddresses.length}</div>
                  <div className="text-xs text-gray-500">总园区</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userAddresses.filter(addr => addr.address).length}
                  </div>
                  <div className="text-xs text-gray-500">有地址</div>
                </div>
              </div>
            </div>

            {/* 表格头部 */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 py-3 px-4 bg-gray-50 rounded-lg mb-4 text-sm font-medium text-gray-600">
              <div>序号</div>
              <div>园区名称</div>
              <div>地址</div>
              <div>坐标位置</div>
              <div>创建时间</div>
              <div>操作</div>
            </div>

            {/* 园区列表 */}
            <div className="space-y-3">
              {userAddresses.map((addr, index) => (
                <div 
                  key={addr.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/park/${addr.id}`)}
                >
                  {/* 移动端垂直布局 */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-900">{index + 1} {addr.name}</h4>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">地址：</span>
                      <span className="text-base text-gray-800">{addr.address || "暂无地址信息"}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">坐标：</span>
                      <span className="text-base font-mono text-gray-800">
                        {addr.lat?.toFixed(6)}, {addr.lng?.toFixed(6)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">创建时间：</span>
                      <span className="text-base text-gray-800">
                        {new Date(addr.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          setMapCenter({ lat: addr.lat, lng: addr.lng });
                          setMarkers([{ lat: addr.lat, lng: addr.lng }]);
                          setMapZoom(15);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        地图定位
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          deletePark(addr.id, addr.name);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  {/* 桌面端水平布局 */}
                  <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                    <div className="text-base font-medium text-gray-900">
                      {index + 1}
                    </div>
                    
                    <div className="text-base font-bold text-gray-900 truncate">
                      {addr.name}
                    </div>
                    
                    <div className="text-base text-gray-700 truncate">
                      {addr.address || "暂无地址信息"}
                    </div>
                    
                    <div className="text-sm font-mono text-gray-700">
                      <div>{addr.lat?.toFixed(6)}</div>
                      <div>{addr.lng?.toFixed(6)}</div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {new Date(addr.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          setMapCenter({ lat: addr.lat, lng: addr.lng });
                          setMarkers([{ lat: addr.lat, lng: addr.lng }]);
                          setMapZoom(15);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        定位
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          deletePark(addr.id, addr.name);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态提示 */}
            {userAddresses.length === 0 && (
              <div className="text-center py-12">
                <h4 className="text-xl font-semibold text-gray-700 mb-2">还没有园区</h4>
                <p className="text-gray-500">点击上方地图添加您的第一个园区</p>
              </div>
            )}
          </div>
        )}
      </div>

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
