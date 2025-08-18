'use client'
import TencentMap from '@/components/TencentMap'

export default function DashboardPage() {
  return (
    <div className="p-4 text-center bg-gray-100 z-0">
        
        <input type="text" placeholder="输入地点名称" className="text-xl py-2 px-3 border border-blue-800 w-[15vw] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <button className="m-3 bg-blue-500 text-white py-2 px-3 text-xl hover:bg-blue-700 transition-colors">搜索</button>
      <TencentMap
        center={{ lat: 34.2632, lng: 108.9480 }}
        zoom={4}
        markers={[
          { lat: 39.908802, lng: 116.397502, title: '天安门' },
          { lat: 34.2632, lng: 108.9480, title: '西安' }
        ]}
        className="w-full h-[70vh] rounded shadow overflow-hidden"
      />
    </div>
  )
}