'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import TencentMap from '@/components/TencentMap'

export default function Task() {

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login'); // 用户未登录，跳转登录页
      } else {
        setLoading(false); // 用户已登录
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


  const [clickedCoords, setClickedCoords] = useState<{lat: number, lng: number} | null>(null)
  const [markers, setMarkers] = useState<{lat: number, lng: number}[]>([])

  const handleMapClick = (lat: number, lng: number) => {
    setMarkers([{ lat, lng }]) // 只保留一个marker，或累加都可以
    setClickedCoords({ lat, lng })
    console.log('点击坐标:', lat, lng)
  }

  return (
    <div className="z-0 container mx-auto p-4 bg-gray-50 rounded shadow m-4 min-h-screen text-center">
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className='flex gap-6 p-4'>  {/* 减少内边距，添加gap */}
          
          <div className="w-3/4 h-[50vh]">
            <h1 className="text-2xl mb-4 text-blue-500">点击获得地图精确坐标</h1>
            <TencentMap
              center={{ lat: 34.2632, lng: 108.9480 }}
              zoom={5}
              markers={markers}
              onMapClick={handleMapClick}
              allowAddMarker={false} // 关闭组件内部动态marker
            />
          </div>

          <div className='w-1/4 flex flex-col items-center space-y-4 py-12'>
            <h1 className="text-4xl mb-4 text-blue-500">添加园区信息</h1>
            
            <input 
              type="text" 
              placeholder="园区名字" 
              className="border w-80 p-2 rounded border-gray-400 m-4"
            />

            <input 
              type='text' 
              placeholder='地址' 
              className='p-2 w-80 border border-gray-400 rounded m-4'
            />
            
            {clickedCoords && (
              <div className="text-xl bg-gray-100 p-2 my-8 rounded w-64 max-w-sm text-yellow-900 transform hover:scale-110 transition">
                <p><strong>坐标:</strong></p>
                <p>纬度: {clickedCoords.lat.toFixed(6)}</p>
                <p>经度: {clickedCoords.lng.toFixed(6)}</p>
              </div>
            )}
            
            <button className='px-8 py-2 mt-16 rounded bg-blue-500 text-white text-xl hover:bg-blue-900 transition-colors'>
              添加到数据库
            </button>
          </div>
        </div>

      )}
      <div>
        test
      </div>
    </div>
  )
}
