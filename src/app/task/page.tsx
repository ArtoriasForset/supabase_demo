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
              zoom={5}
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
            <div className="text-sm text-gray-600 mt-4">
              已保存 {userAddresses.length} 个园区
            </div>
          </div>
        </div>
      )}
      
      <div className="m-8 p-4 bg-white rounded shadow">
        {user && (
          <div>
            {/* 显示用户的所有园区 */}
            {userAddresses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-2xl font-semibold mb-3">我的园区列表 ({userAddresses.length})</h3>
                <div className="space-y-3">
                  {userAddresses.map((addr) => (
                    <div key={addr.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-blue-600">{addr.name}</h4>
                        <p className="text-sm text-gray-600">
                          {addr.address || '无地址信息'} • 
                          坐标: {addr.lat?.toFixed(4)}, {addr.lng?.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-400">
                          创建时间: {new Date(addr.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePark(addr.id, addr.name)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-4"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
