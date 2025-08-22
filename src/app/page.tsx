'use client';

import Image from "next/image";
import UserStatus from "./UserStatus";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface WebsiteConfig {
  site_title: string
  site_subtitle: string
}

export default function Home() {
  const [config, setConfig] = useState<WebsiteConfig>({
    site_title: '西安数智化产业园区',
    site_subtitle: '专业的园区资产管理与产业服务平台'
  })

  useEffect(() => {
    fetchWebsiteConfig()
  }, [])

  const fetchWebsiteConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('website_config')
        .select('config_key, config_value')
        .in('config_key', ['site_title', 'site_subtitle'])

      if (error) {
        console.error('获取网站配置失败:', error)
        return
      }

      if (data) {
        const configObj: any = { ...config } // 保持默认值
        data.forEach(item => {
          configObj[item.config_key] = item.config_value
        })
        setConfig(configObj)
      }
    } catch (error) {
      console.error('获取网站配置错误:', error)
    }
  }

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
              {config.site_title}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {config.site_subtitle}
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
              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600 group">
                <div className="mb-6">
                  <div className="w-16 h-1 bg-blue-600 mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">投资服务</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 产业基金投资</p>
                  <p className="text-gray-600 text-sm">• 股权投资服务</p>
                  <p className="text-gray-600 text-sm">• 资本运作咨询</p>
                  <p className="text-gray-600 text-sm">• 投后管理服务</p>
                </div>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-600 group">
                <div className="mb-6">
                  <div className="w-16 h-1 bg-green-600 mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">企业孵化</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 创业项目孵化</p>
                  <p className="text-gray-600 text-sm">• 商业模式指导</p>
                  <p className="text-gray-600 text-sm">• 市场拓展支持</p>
                  <p className="text-gray-600 text-sm">• 团队建设辅导</p>
                </div>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-600 group">
                <div className="mb-6">
                  <div className="w-16 h-1 bg-purple-600 mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">专业培训</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 技术技能培训</p>
                  <p className="text-gray-600 text-sm">• 管理能力提升</p>
                  <p className="text-gray-600 text-sm">• 行业认证课程</p>
                  <p className="text-gray-600 text-sm">• 定制化培训</p>
                </div>
              </div>

              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-600 group">
                <div className="mb-6">
                  <div className="w-16 h-1 bg-orange-600 mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">商务交流</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 高端商务对接</p>
                  <p className="text-gray-600 text-sm">• 行业峰会论坛</p>
                  <p className="text-gray-600 text-sm">• 项目路演展示</p>
                  <p className="text-gray-600 text-sm">• 合作伙伴推介</p>
                </div>
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
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">创业空间</h3>
                  <div className="w-12 h-0.5 bg-blue-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 灵活办公空间配置</p>
                  <p className="text-gray-600 text-sm">• 现代化办公设备</p>
                  <p className="text-gray-600 text-sm">• 24小时安全保障</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">人才公寓</h3>
                  <div className="w-12 h-0.5 bg-green-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 精装修住宿环境</p>
                  <p className="text-gray-600 text-sm">• 完善生活配套设施</p>
                  <p className="text-gray-600 text-sm">• 优惠住宿政策</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">企业家俱乐部</h3>
                  <div className="w-12 h-0.5 bg-purple-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 高端商务交流平台</p>
                  <p className="text-gray-600 text-sm">• 定期行业分享会</p>
                  <p className="text-gray-600 text-sm">• 精英网络建设</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">招商中心</h3>
                  <div className="w-12 h-0.5 bg-red-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 专业招商团队</p>
                  <p className="text-gray-600 text-sm">• 产业政策咨询</p>
                  <p className="text-gray-600 text-sm">• 项目落地服务</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">投融资平台</h3>
                  <div className="w-12 h-0.5 bg-indigo-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 多元化融资渠道</p>
                  <p className="text-gray-600 text-sm">• 资本项目对接</p>
                  <p className="text-gray-600 text-sm">• 金融政策解读</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">技术展厅</h3>
                  <div className="w-12 h-0.5 bg-teal-500 mt-2"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">• 前沿技术展示</p>
                  <p className="text-gray-600 text-sm">• 创新成果发布</p>
                  <p className="text-gray-600 text-sm">• 技术交流论坛</p>
                </div>
              </div>
            </div>
          </div>

          {/* 三大核心中心 */}
          <div className="bg-white rounded-xl shadow-lg p-12 mb-16 border border-gray-200">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                三大核心中心
              </h2>
              <p className="text-gray-600 text-lg">
                构建完整的产业服务生态链
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center border-r border-gray-200 last:border-r-0">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">研究中心</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-4"></div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">前沿技术研发</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">产业应用创新</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">技术成果转化</span>
                  </div>
                </div>
              </div>

              <div className="text-center border-r border-gray-200 last:border-r-0">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">服务中心</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto mb-4"></div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">企业注册服务</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">财务法务支持</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">人力资源服务</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">孵化中心</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-purple-600 mx-auto mb-4"></div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">创业项目孵化</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">导师指导服务</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">加速成长计划</span>
                  </div>
                </div>
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
              <div className="text-center group">
                <div className="border border-red-600 rounded-lg p-6 hover:bg-red-600 transition-colors duration-300">
                  <h3 className="font-bold text-lg mb-3">5G技术</h3>
                  <div className="w-12 h-0.5 bg-red-600 group-hover:bg-white mx-auto mb-3"></div>
                  <p className="text-sm opacity-75">新一代通信技术基础设施建设与应用开发</p>
                </div>
              </div>

              <div className="text-center group">
                <div className="border border-blue-600 rounded-lg p-6 hover:bg-blue-600 transition-colors duration-300">
                  <h3 className="font-bold text-lg mb-3">大数据</h3>
                  <div className="w-12 h-0.5 bg-blue-600 group-hover:bg-white mx-auto mb-3"></div>
                  <p className="text-sm opacity-75">数据分析处理与智能决策支持系统</p>
                </div>
              </div>

              <div className="text-center group">
                <div className="border border-green-600 rounded-lg p-6 hover:bg-green-600 transition-colors duration-300">
                  <h3 className="font-bold text-lg mb-3">人工智能</h3>
                  <div className="w-12 h-0.5 bg-green-600 group-hover:bg-white mx-auto mb-3"></div>
                  <p className="text-sm opacity-75">机器学习算法与智能化解决方案</p>
                </div>
              </div>

              <div className="text-center group">
                <div className="border border-purple-600 rounded-lg p-6 hover:bg-purple-600 transition-colors duration-300">
                  <h3 className="font-bold text-lg mb-3">工业互联网</h3>
                  <div className="w-12 h-0.5 bg-purple-600 group-hover:bg-white mx-auto mb-3"></div>
                  <p className="text-sm opacity-75">智能制造与工业数字化转型平台</p>
                </div>
              </div>

              <div className="text-center group">
                <div className="border border-pink-600 rounded-lg p-6 hover:bg-pink-600 transition-colors duration-300">
                  <h3 className="font-bold text-lg mb-3">数字创意</h3>
                  <div className="w-12 h-0.5 bg-pink-600 group-hover:bg-white mx-auto mb-3"></div>
                  <p className="text-sm opacity-75">创意产业数字化与内容科技创新</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </> 
  );
}
