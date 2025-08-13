'use client'
import TencentMap from '@/components/TencentMap'

export default function DashboardPage() {
  return (
    <div className="p-4 text-center">
        <h1 className="text-4xl p-4 h-full font-bold mb-4 text-blue-800">全国布局图</h1>
        <input type="text" placeholder="搜索地点" className="mb-4 p-4 border border-blue-800 rounded w-[20vw]" />
      <TencentMap
        center={{ lat: 39.908802, lng: 116.397502 }}
        zoom={12}
        markers={[
          { lat: 39.908802, lng: 116.397502, title: '天安门' },
          { lat: 39.914889, lng: 116.403874, title: '故宫' }
        ]}
        className="w-full h-[70vh] rounded shadow"
      />
    </div>
  )
}