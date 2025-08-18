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
  allowAddMarker = false
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)
  const dynamicMarkersRef = useRef<Marker[]>([])
  const isInitializingRef = useRef(false) // 防止重复初始化

  const buildMarkerGeometries = useCallback(() => {
    const allMarkers = [...markers, ...dynamicMarkersRef.current]
    return allMarkers.map((m, index) => ({
      id: `marker_${m.lat}_${m.lng}_${index}`,
      position: new window.TMap.LatLng(m.lat, m.lng),
      properties: { title: m.title || '' },
      styleId: m.iconUrl ? 'customIcon' : 'default'
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
  }, [buildMarkerGeometries])

  const cleanup = useCallback(() => {
    // 清理地图实例
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

      // Marker 样式集合
      const styles: Record<string, any> = {
        default: new window.TMap.MarkerStyle({
          width: 24,
          height: 24,
          src: '/mRed.png',
          anchor: { x: 12, y: 24 }
        }),
      }

      const firstWithIcon = markers.find(m => m.iconUrl)
      if (firstWithIcon && firstWithIcon.iconUrl) {
        styles.customIcon = new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          src: firstWithIcon.iconUrl,
          anchor: { x: 16, y: 32 }
        })
      }

      markerLayerRef.current = new window.TMap.MultiMarker({
        id: 'marker-layer',
        map: mapRef.current,
        styles,
        geometries: buildMarkerGeometries()
      })

      // 地图点击事件
      mapRef.current.on('click', (evt: any) => {
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
            title: `点击点 (${lat.toFixed(6)}, ${lng.toFixed(6)})`
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
  }, [center, zoom, pitch, rotation, styleId, showControls, markers, buildMarkerGeometries, updateMarkers, onMapClick, allowAddMarker])

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
    
    try {
      markerLayerRef.current.setGeometries(buildMarkerGeometries())
    } catch (error) {
      console.error('更新markers失败:', error)
    }
  }, [markers, buildMarkerGeometries])

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