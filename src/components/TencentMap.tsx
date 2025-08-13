'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    TMap: any
  }
}

interface Marker {
  lat: number
  lng: number
  title?: string
  iconUrl?: string      // 可选：单独图标
}

interface Props {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  markers?: Marker[]
  styleId?: string           // 腾讯控制台自定义样式ID
  pitch?: number             // 倾角 0-60
  rotation?: number          // 旋转 0-360
  showControls?: boolean     // 是否显示缩放/比例尺
}

export default function TencentMap({
  center = { lat: 39.908802, lng: 116.397502 },
  zoom = 11,
  className = 'w-full h-[480px] rounded overflow-hidden',
  markers = [],
  styleId,          // 如 'style1c1b2xxxx'
  pitch = 0,
  rotation = 0,
  showControls = true
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TENCENT_MAP_KEY
    if (!key) {
      console.warn('缺少 NEXT_PUBLIC_TENCENT_MAP_KEY')
      return
    }

    const buildMarkerGeometries = () =>
      markers.map(m => ({
        id: `${m.lat}_${m.lng}_${m.title ?? ''}`,
        position: new window.TMap.LatLng(m.lat, m.lng),
        properties: { title: m.title || '' },
        styleId: m.iconUrl ? 'customIcon' : 'default'
      }))

    const init = () => {
      if (!divRef.current || !window.TMap) return

      // 初始化地图
      mapRef.current = new window.TMap.Map(divRef.current, {
        center: new window.TMap.LatLng(center.lat, center.lng),
        zoom,
        pitch,
        rotation,
        mapStyleId: styleId || undefined,
      })

      // 可选控件（加健壮性判断）
      if (
        showControls &&
        window.TMap.control &&
        typeof window.TMap.control.Scale === 'function' &&
        typeof window.TMap.control.Zoom === 'function'
      ) {
        new window.TMap.control.Scale({
          position: window.TMap.constants.CONTROL_POSITION.BOTTOM_LEFT,
          map: mapRef.current
        })
        new window.TMap.control.Zoom({
          position: window.TMap.constants.CONTROL_POSITION.RIGHT_CENTER,
          map: mapRef.current
        })
      }

      // Marker 样式集合
      const styles: Record<string, any> = {
        default: new window.TMap.MarkerStyle({
          width: 24,
          height: 24,
          src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/markerRed.png',
          anchor: { x: 12, y: 24 }
        }),
      }

      // 如果 markers 中存在 iconUrl，动态添加 customIcon 样式
      const firstWithIcon = markers.find(m => m.iconUrl)
      if (firstWithIcon) {
        styles.customIcon = new window.TMap.MarkerStyle({
          width: 32,
          height: 32,
          src: firstWithIcon.iconUrl, // 必须是有效图片地址
          anchor: { x: 16, y: 32 }
        })
      }

      markerLayerRef.current = new window.TMap.MultiMarker({
        id: 'marker-layer',
        map: mapRef.current,
        styles,
        geometries: buildMarkerGeometries()
      })

      // 简单信息提示
      mapRef.current.on('click', (evt: any) => {
        // 可扩展
      })
    }

    // 若已加载 SDK
    if (window.TMap) {
      init()
      return
    }

    // 已存在脚本则监听
    const exist = document.querySelector<HTMLScriptElement>('script[data-tmap]')
    if (exist) {
      exist.addEventListener('load', init)
      return () => exist.removeEventListener('load', init)
    }

    const script = document.createElement('script')
    script.setAttribute('data-tmap', 'true')
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${key}`
    script.onload = init
    script.onerror = () => console.error('腾讯地图脚本加载失败')
    document.head.appendChild(script)

    return () => {
      markerLayerRef.current?.setMap(null)
      markerLayerRef.current = null
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, []) // 仅初始化一次

  // 动态更新：中心 / zoom / pitch / rotation / style / markers
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(new window.TMap.LatLng(center.lat, center.lng))
    mapRef.current.setZoom(zoom)
    mapRef.current.setPitch(pitch)
    mapRef.current.setRotation(rotation)
    if (styleId) {
      mapRef.current.setMapStyleId(styleId)
    }
  }, [center.lat, center.lng, zoom, pitch, rotation, styleId])

  useEffect(() => {
    if (!markerLayerRef.current || !window.TMap) return
    // 清空再赋值
    markerLayerRef.current.setGeometries([])
    markerLayerRef.current.setGeometries(
      markers.map(m => ({
        id: `${m.lat}_${m.lng}_${m.title ?? ''}`,
        position: new window.TMap.LatLng(m.lat, m.lng),
        properties: { title: m.title || '' },
        styleId: m.iconUrl ? 'customIcon' : 'default'
      }))
    )
  }, [markers])

  return (
    <div className={className}>
      <div ref={divRef} className="w-full h-full" />
    </div>
  )
}