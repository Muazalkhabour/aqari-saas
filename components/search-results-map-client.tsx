'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { LocateFixed, MapPinned } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { SyrianProperty } from '@/lib/syrian-real-estate-demo'
import { getPropertyCoordinates } from '@/lib/syrian-real-estate-demo'

type SearchResultsMapClientProps = {
  properties: SyrianProperty[]
}

type LatLng = {
  latitude: number
  longitude: number
}

function buildMarkerIcon(label: string, kind: 'sale' | 'rent' | 'user') {
  return L.divIcon({
    className: '',
    html: `<div class="search-map-marker ${kind}">${label}</div>`,
    iconSize: [78, 34],
    iconAnchor: [39, 34],
    popupAnchor: [0, -28],
  })
}

const saleIcon = buildMarkerIcon('بيع', 'sale')
const rentIcon = buildMarkerIcon('إيجار', 'rent')
const userIcon = buildMarkerIcon('موقعي', 'user')

function haversineDistance(left: LatLng, right: LatLng) {
  const toRadians = (value: number) => value * (Math.PI / 180)
  const earthRadiusKm = 6371
  const deltaLat = toRadians(right.latitude - left.latitude)
  const deltaLng = toRadians(right.longitude - left.longitude)
  const latitudeA = toRadians(left.latitude)
  const latitudeB = toRadians(right.latitude)

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLng / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function FitMapBounds({ points }: { points: LatLng[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) {
      return
    }

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 11)
      return
    }

    const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]))
    map.fitBounds(bounds.pad(0.18))
  }, [map, points])

  return null
}

export function SearchResultsMapClient({ properties }: SearchResultsMapClientProps) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  const markers = useMemo(() => properties.map((property) => ({
    property,
    coordinates: getPropertyCoordinates(property),
  })), [properties])

  const nearestProperties = useMemo(() => {
    if (!userLocation) {
      return []
    }

    return markers
      .map((marker) => ({
        property: marker.property,
        distanceKm: haversineDistance(userLocation, marker.coordinates),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, 3)
  }, [markers, userLocation])

  const points = useMemo(() => {
    const basePoints = markers.map((marker) => marker.coordinates)
    return userLocation ? [userLocation, ...basePoints] : basePoints
  }, [markers, userLocation])

  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('المتصفح الحالي لا يدعم تحديد الموقع.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationMessage('تم تحديد موقعك وعرض أقرب العقارات إليك.')
      },
      () => {
        setLocationMessage('تعذر الوصول إلى موقعك. يمكنك متابعة استخدام الخريطة بشكل يدوي.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-slate-950">
            <MapPinned className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">الخريطة التفاعلية للعقارات</h2>
          </div>
          <p className="body-soft mt-2 text-sm text-[var(--muted)]">
            العقارات المعروضة الآن مرتبطة بخريطة حية. يمكنك تحديد موقعك لمعرفة الأقرب إليك، أو التنقل على الخريطة لقراءة كل عرض بصريًا.
          </p>
        </div>

        <button type="button" onClick={requestCurrentLocation} className="btn-base btn-secondary btn-sm self-start">
          حدد موقعي الآن
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      {locationMessage ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-[var(--surface)] px-4 py-3 text-sm text-slate-700">
          {locationMessage}
        </div>
      ) : null}

      {nearestProperties.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {nearestProperties.map(({ property, distanceKm }) => (
            <div key={property.id} className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-950">{property.title}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">يبعد تقريبًا {distanceKm.toFixed(1)} كم</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
        <MapContainer
          center={[34.8, 38.7]}
          zoom={7}
          scrollWheelZoom
          className="search-map-shell"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapBounds points={points} />

          {markers.map(({ property, coordinates }) => (
            <Marker
              key={property.id}
              position={[coordinates.latitude, coordinates.longitude]}
              icon={property.type === 'بيع' ? saleIcon : rentIcon}
            >
              <Popup>
                <div className="space-y-2 text-right">
                  <div className="text-sm font-bold text-slate-950">{property.title}</div>
                  <div className="text-xs text-slate-600">{property.governorate} - {property.neighborhood}</div>
                  <div className="text-xs font-semibold text-slate-950">{property.priceLabel}</div>
                  <Link href={`/properties/${property.id}`} className="text-xs font-bold text-emerald-800 underline underline-offset-4">
                    افتح التفاصيل
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {userLocation ? (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="text-sm font-bold text-slate-950">موقعك الحالي</div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </section>
  )
}