'use client';

import Image from "next/image";
import UserStatus from "./UserStatus";
import Link from "next/link";

export default function Home() {
  return (
    <>  
      {/* 英雄区域 - 保持原有图片 */}
      <div className="w-full h-[60vh] relative z-0 bg-gray-900">
        <Image
          src="/beijing.jpg"
          alt="首页主图"
          fill
          className="object-cover opacity-70"
          priority
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              西安数智化产业园区
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              专业的园区资产管理与产业服务平台
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/task" 
                className="text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-block px-8 py-3 rounded"
              >
                添加园区
              </Link>
              <Link 
                href="/dashboard" 
                className="text-lg font-medium text-blue-600 bg-white hover:bg-gray-100 transition-colors inline-block px-8 py-3 rounded"
              >
                园区地图
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 专业化主内容区 */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 核心业务模块 */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                核心业务板块
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                集投资、孵化、培训、交流于一体的综合性产业服务平台
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-blue-600">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">投资服务</h3>
                <p className="text-gray-600">专业的产业投资与资本运作服务</p>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-600">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-green-600">🏭</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">企业孵化</h3>
                <p className="text-gray-600">全方位的企业成长孵化与加速服务</p>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-600">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-purple-600">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">专业培训</h3>
                <p className="text-gray-600">行业前沿的专业技能培训体系</p>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-600">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-orange-600">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">商务交流</h3>
                <p className="text-gray-600">高端的商务合作与交流平台</p>
              </div>
            </div>
          </div>

          {/* 园区设施 */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                完善的园区设施
              </h2>
              <p className="text-gray-600 text-lg">
                六大功能区域，为企业发展提供全方位配套服务
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">🏢</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">创业空间</h3>
                </div>
                <p className="text-gray-600">现代化办公环境，灵活的空间配置方案</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">🏠</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">人才公寓</h3>
                </div>
                <p className="text-gray-600">高品质人才住宿配套，解决后顾之忧</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">👔</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">企业家俱乐部</h3>
                </div>
                <p className="text-gray-600">精英企业家交流与合作的专属平台</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">📈</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">招商中心</h3>
                </div>
                <p className="text-gray-600">专业的招商引资与项目对接服务</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">💼</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">投融资平台</h3>
                </div>
                <p className="text-gray-600">多元化的投融资渠道与资本对接</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg">🔬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">技术展厅</h3>
                </div>
                <p className="text-gray-600">前沿技术成果展示与交流中心</p>
              </div>
            </div>
          </div>

          {/* 三大核心中心 */}
          <div className="bg-white rounded-xl shadow-lg p-12 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                三大核心中心
              </h2>
              <p className="text-gray-600 text-lg">
                构建完整的产业服务生态链
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white">🔬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">研究中心</h3>
                <p className="text-gray-600">专注前沿技术研发与产业应用创新</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white">🛠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">服务中心</h3>
                <p className="text-gray-600">提供全方位的企业成长服务支持</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white">🥚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">孵化中心</h3>
                <p className="text-gray-600">专业的创业项目孵化与加速平台</p>
              </div>
            </div>
          </div>

          {/* 重点产业方向 */}
          <div className="bg-gray-900 rounded-xl p-12 text-white mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">
                重点产业方向
              </h2>
              <p className="text-xl opacity-90">
                聚焦五大核心技术领域，打造产业发展新高地
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📡</span>
                </div>
                <h3 className="font-bold text-lg mb-2">5G技术</h3>
                <p className="text-sm opacity-75">新一代通信技术</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold text-lg mb-2">大数据</h3>
                <p className="text-sm opacity-75">数据驱动决策</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-bold text-lg mb-2">人工智能</h3>
                <p className="text-sm opacity-75">智能化解决方案</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏭</span>
                </div>
                <h3 className="font-bold text-lg mb-2">工业互联网</h3>
                <p className="text-sm opacity-75">智能制造平台</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-bold text-lg mb-2">数字创意</h3>
                <p className="text-sm opacity-75">创意产业数字化</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </> 
  );
}
