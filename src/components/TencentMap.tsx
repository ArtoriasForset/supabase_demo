'use client'
import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    TMap: any
  }
}

interface Marker {
  lat: number
  lng: number
  title?: string
  iconUrl?: string
  label?: string
  id?: string
  description?: string
  hasAccess?: boolean
}

interface Props {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  markers?: Marker[]
  styleId?: string
  pitch?: number
  rotation?: number
  showControls?: boolean
  onMapClick?: (lat: number, lng: number) => void
  allowAddMarker?: boolean
  onMarkerClick?: (marker: Marker) => void
}

export default function TencentMap({
  center = { lat: 39.908802, lng: 116.397502 },
  zoom = 11,
  className = 'w-full h-[480px] rounded overflow-hidden',
  markers = [],
  styleId,
  pitch = 0,
  rotation = 0,
  showControls = false,
  onMapClick,
  allowAddMarker = false,
  onMarkerClick
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)
  const labelLayerRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
  const dynamicMarkersRef = useRef<Marker[]>([])
  const isInitializingRef = useRef(false)

  const buildMarkerGeometries = useCallback(() => {
    const allMarkers = [...markers, ...dynamicMarkersRef.current]
    return allMarkers.map((m, index) => ({
      id: `marker_${m.lat}_${m.lng}_${index}`,
      position: new window.TMap.LatLng(m.lat, m.lng),
      properties: { 
        title: m.title || '',
        label: m.label || '',
        id: m.id || '',
        description: m.description || '',
        markerData: m
      },
      styleId: 'redMarker'
    }))
  }, [markers])

  // 构建标签几何数据 - 美化样式
  const buildLabelGeometries = useCallback(() => {
    const allMarkers = [...markers, ...dynamicMarkersRef.current]
    return allMarkers
      .filter(m => m.label)
      .map((m, index) => ({
        id: `label_${m.lat}_${m.lng}_${index}`,
        position: new window.TMap.LatLng(m.lat, m.lng),
        content: m.label,
        properties: {
          markerData: m
        },
        styleId: m.hasAccess === false ? 'labelStyleDisabled' : 'labelStyleEnabled'
      }))
  }, [markers])

  const updateMarkers = useCallback(() => {
    if (markerLayerRef.current && window.TMap) {
      try {
        markerLayerRef.current.setGeometries(buildMarkerGeometries())
      } catch (error) {
        console.error('更新markers失败:', error)
      }
    }

    if (labelLayerRef.current && window.TMap) {
      try {
        labelLayerRef.current.setGeometries(buildLabelGeometries())
      } catch (error) {
        console.error('更新labels失败:', error)
      }
    }
  }, [buildMarkerGeometries, buildLabelGeometries])

  // 显示信息窗口 - 美化样式
  const showInfoWindow = useCallback((markerData: Marker, position: any) => {
    if (!mapRef.current || !window.TMap) return

    try {
      // 关闭现有的信息窗口
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current.destroy()
        infoWindowRef.current = null
      }

      const isAccessible = markerData.hasAccess !== false
      const isDarkMode = styleId === '1' // 检查是否为深色地图

      const content = `
        <div style="
          max-width: 320px;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
          background: ${isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(12px);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          color: ${isDarkMode ? '#ffffff' : '#1f2937'};
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          ">
            <div style="
              width: 16px;
              height: 16px;
              background: ${isAccessible 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #6b7280, #4b5563)'};
              border-radius: 50%;
              box-shadow: 0 0 20px ${isAccessible ? 'rgba(239, 68, 68, 0.4)' : 'rgba(107, 114, 128, 0.3)'};
              animation: pulse 2s infinite;
            "></div>
            <h3 style="
              margin: 0;
              font-size: 20px;
              font-weight: 800;
              color: ${isDarkMode ? '#ffffff' : '#1f2937'};
              text-shadow: ${isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.1)'};
            ">${markerData.title || markerData.label || '园区'}</h3>
            ${!isAccessible ? `
              <div style="
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: #1f2937;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">
                🔒 受限
              </div>
            ` : ''}
          </div>
          
          ${markerData.description ? `
            <div style="
              color: ${isDarkMode ? '#e5e7eb' : '#6b7280'};
              font-size: 15px;
              line-height: 1.6;
              margin-bottom: 16px;
              padding: 12px;
              background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
              border-radius: 12px;
              border-left: 4px solid ${isAccessible ? '#ef4444' : '#6b7280'};
            ">
              📍 ${markerData.description}
            </div>
          ` : ''}
          
          <div style="
            background: ${isDarkMode 
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(50, 50, 50, 0.6))' 
              : 'linear-gradient(135deg, #f8fafc, #e2e8f0)'};
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 13px;
            color: ${isDarkMode ? '#9ca3af' : '#64748b'};
            margin-bottom: 16px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          ">
            🌐 坐标: ${markerData.lat.toFixed(6)}, ${markerData.lng.toFixed(6)}
          </div>
          
          ${markerData.id ? `
            <div style="
              display: flex;
              gap: 10px;
            ">
              ${isAccessible ? `
                <button onclick="window.parkClickHandler && window.parkClickHandler('${markerData.id}')" style="
                  flex: 1;
                  background: linear-gradient(135deg, #ef4444, #dc2626);
                  color: white;
                  border: none;
                  padding: 14px 20px;
                  border-radius: 12px;
                  font-size: 15px;
                  font-weight: 700;
                  cursor: pointer;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
                  letter-spacing: 0.5px;
                  position: relative;
                  overflow: hidden;
                " onmouseover="
                  this.style.transform='translateY(-2px) scale(1.02)'; 
                  this.style.boxShadow='0 8px 25px rgba(239,68,68,0.4)';
                  this.style.background='linear-gradient(135deg, #f87171, #ef4444)';
                " onmouseout="
                  this.style.transform='translateY(0) scale(1)'; 
                  this.style.boxShadow='0 4px 16px rgba(239,68,68,0.3)';
                  this.style.background='linear-gradient(135deg, #ef4444, #dc2626)';
                ">
                  <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    🏢 查看园区详情
                  </span>
                </button>
              ` : `
                <div style="
                  flex: 1;
                  background: linear-gradient(135deg, #6b7280, #4b5563);
                  color: white;
                  padding: 14px 20px;
                  border-radius: 12px;
                  font-size: 15px;
                  font-weight: 700;
                  text-align: center;
                  opacity: 0.7;
                  letter-spacing: 0.5px;
                ">
                  🔒 权限不足
                </div>
              `}
            </div>
          ` : ''}
        </div>
        
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        </style>
      `

      // 创建新的信息窗口
      infoWindowRef.current = new window.TMap.InfoWindow({
        map: mapRef.current,
        content: content,
        position: position,
        enableAutoPan: true,
        offset: { x: 0, y: -15 }
      })

      // 打开信息窗口
      infoWindowRef.current.open()

    } catch (error) {
      console.error('显示信息窗口失败:', error)
    }
  }, [styleId])

  const cleanup = useCallback(() => {
    // 清理信息窗口
    if (infoWindowRef.current) {
      try {
        infoWindowRef.current.close()
        infoWindowRef.current.destroy()
      } catch (error) {
        console.warn('清理信息窗口失败:', error)
      }
      infoWindowRef.current = null
    }

    // 清理标签图层
    if (labelLayerRef.current) {
      try {
        labelLayerRef.current.setMap(null)
      } catch (error) {
        console.warn('清理labelLayer失败:', error)
      }
      labelLayerRef.current = null
    }

    // 清理标记图层
    if (markerLayerRef.current) {
      try {
        markerLayerRef.current.setMap(null)
      } catch (error) {
        console.warn('清理markerLayer失败:', error)
      }
      markerLayerRef.current = null
    }
    
    if (mapRef.current) {
      try {
        mapRef.current.destroy()
      } catch (error) {
        console.warn('销毁地图失败:', error)
      }
      mapRef.current = null
    }
    
    // 清空容器内容
    if (divRef.current) {
      divRef.current.innerHTML = ''
    }
    
    // 重置动态markers
    dynamicMarkersRef.current = []
    isInitializingRef.current = false
  }, [])

  const init = useCallback(() => {
    if (!divRef.current || !window.TMap || isInitializingRef.current || mapRef.current) {
      return
    }

    isInitializingRef.current = true

    try {
      // 清空容器内容，防止重复渲染
      divRef.current.innerHTML = ''

      // 初始化地图
      mapRef.current = new window.TMap.Map(divRef.current, {
        center: new window.TMap.LatLng(center.lat, center.lng),
        zoom,
        pitch,
        rotation,
        mapStyleId: styleId || undefined,
      })

      // 可选控件
      if (showControls && window.TMap.control) {
        if (typeof window.TMap.control.Scale === 'function') {
          new window.TMap.control.Scale({
            position: window.TMap.constants.CONTROL_POSITION.BOTTOM_LEFT,
            map: mapRef.current
          })
        }
        if (typeof window.TMap.control.Zoom === 'function') {
          new window.TMap.control.Zoom({
            position: window.TMap.constants.CONTROL_POSITION.RIGHT_CENTER,
            map: mapRef.current
          })
        }
      }

      // Marker 样式集合 - 使用自定义红色图标
      const markerStyles: Record<string, any> = {
        redMarker: new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          anchor: { x: 16, y: 32 },
          src: '/mRed.png'
        })
      }

      // 创建标记图层
      markerLayerRef.current = new window.TMap.MultiMarker({
        id: 'marker-layer',
        map: mapRef.current,
        styles: markerStyles,
        geometries: buildMarkerGeometries()
      })

      // 标签样式 - 修复黑色地图上的文字可读性
      const isDarkMap = styleId === '1'
      
      const labelStyles = {
        // 可访问的标签样式 - 白色文字，红色背景
        labelStyleEnabled: new window.TMap.LabelStyle({
          color: '#ffffff', // 白色文字
          size: 14,
          offset: { x: 0, y: -50 },
          angle: 0,
          alignment: 'center',
          verticalAlignment: 'middle',
          background: {
            color: '#dc2626', // 红色背景
            padding: { x: 16, y: 10 },
            borderRadius: 20
          },
          border: {
            color: '#ffffff', // 白色边框
            width: 3
          }
        }),
        // 不可访问的标签样式 - 白色文字，灰色背景
        labelStyleDisabled: new window.TMap.LabelStyle({
          color: '#ffffff', // 白色文字
          size: 14,
          offset: { x: 0, y: -50 },
          angle: 0,
          alignment: 'center',
          verticalAlignment: 'middle',
          background: {
            color: '#6b7280', // 灰色背景
            padding: { x: 16, y: 10 },
            borderRadius: 20
          },
          border: {
            color: '#ffffff', // 白色边框
            width: 2
          }
        })
      }

      // 创建标签图层
      labelLayerRef.current = new window.TMap.MultiLabel({
        id: 'label-layer',
        map: mapRef.current,
        styles: labelStyles,
        geometries: buildLabelGeometries()
      })

      // 标记点击事件
      markerLayerRef.current.on('click', (evt: any) => {
        const geometry = evt.geometry
        if (geometry && geometry.properties) {
          const markerData = geometry.properties.markerData
          if (markerData) {
            // 触发标记点击回调
            if (onMarkerClick) {
              onMarkerClick(markerData)
            }
            // 显示信息窗口
            showInfoWindow(markerData, geometry.position)
          }
        }
      })

      // 标签点击事件
      labelLayerRef.current.on('click', (evt: any) => {
        const geometry = evt.geometry
        if (geometry && geometry.properties) {
          const markerData = geometry.properties.markerData
          if (markerData) {
            // 触发标记点击回调
            if (onMarkerClick) {
              onMarkerClick(markerData)
            }
            // 显示信息窗口
            showInfoWindow(markerData, geometry.position)
          }
        }
      })

      // 地图点击事件 - 关闭信息窗口
      mapRef.current.on('click', (evt: any) => {
        // 如果点击的不是标记，关闭信息窗口
        if (infoWindowRef.current && !evt.geometry) {
          infoWindowRef.current.close()
        }

        const lat = evt.latLng.getLat()
        const lng = evt.latLng.getLng()
        
        // 调用回调函数
        if (onMapClick) {
          onMapClick(lat, lng)
        }

        // 如果允许添加marker，则在点击位置添加
        if (allowAddMarker) {
          const newMarker: Marker = {
            lat,
            lng,
            title: `点击点 (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
            label: `新点${dynamicMarkersRef.current.length + 1}`
          }
          
          // 添加到动态markers数组
          dynamicMarkersRef.current = [...dynamicMarkersRef.current, newMarker]
          
          // 更新地图上的markers
          updateMarkers()
        }

        console.log('点击坐标:', { lat, lng })
      })

    } catch (error) {
      console.error('地图初始化失败:', error)
    } finally {
      isInitializingRef.current = false
    }
  }, [center, zoom, pitch, rotation, styleId, showControls, markers, buildMarkerGeometries, buildLabelGeometries, updateMarkers, onMapClick, allowAddMarker, onMarkerClick, showInfoWindow])

  // 主初始化 useEffect
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TENCENT_MAP_KEY
    if (!key) {
      console.warn('缺少 NEXT_PUBLIC_TENCENT_MAP_KEY')
      return
    }

    // 如果 TMap 已存在，直接初始化
    if (window.TMap) {
      init()
      return
    }

    // 检查是否已存在脚本
    const exist = document.querySelector<HTMLScriptElement>('script[data-tmap]')
    if (exist) {
      const handleLoad = () => init()
      exist.addEventListener('load', handleLoad)
      return () => exist.removeEventListener('load', handleLoad)
    }

    // 创建新脚本
    const script = document.createElement('script')
    script.setAttribute('data-tmap', 'true')
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${key}`
    script.onload = init
    script.onerror = () => console.error('腾讯地图脚本加载失败')
    document.head.appendChild(script)

    return cleanup
  }, [init, cleanup])

  // 父组件 markers 变化时，清空动态 markers 并更新
  useEffect(() => {
    if (!markerLayerRef.current || !window.TMap) return
    
    // 清空动态添加的 markers
    dynamicMarkersRef.current = []
    
    updateMarkers()
  }, [markers, updateMarkers])

  // 其他地图属性变化时更新
  useEffect(() => {
    if (!mapRef.current || !window.TMap) return
    
    try {
      mapRef.current.setCenter(new window.TMap.LatLng(center.lat, center.lng))
      mapRef.current.setZoom(zoom)
      mapRef.current.setPitch(pitch)
      mapRef.current.setRotation(rotation)
      if (styleId) {
        mapRef.current.setMapStyleId(styleId)
      }
    } catch (error) {
      console.error('更新地图属性失败:', error)
    }
  }, [center.lat, center.lng, zoom, pitch, rotation, styleId])

  return (
    <div className={className}>
      <div ref={divRef} className="w-full h-full" />
    </div>
  )
}