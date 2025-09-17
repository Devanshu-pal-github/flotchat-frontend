import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function ClickCatcher({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng)
    }
  })
  return null
}

export default function MapComponent({ data = [], selectedVariable = 'temperature', onFloatSelect = ()=>{}, onMapClick = null, height = 360 }) {
  const center = [20.5937, 78.9629] // India approx
  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {onMapClick && <ClickCatcher onMapClick={onMapClick} />}
        {data.map((f) => (
          <CircleMarker key={f.id} center={[f.lat, f.lon]} radius={6} pathOptions={{ color: '#1976d2' }} eventHandlers={{ click: ()=>onFloatSelect(f.id) }}>
            <Popup>
              <div>
                <div><strong>Float:</strong> {f.id}</div>
                <div><strong>{selectedVariable}:</strong> {f[selectedVariable] ?? 'n/a'}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {!data.length && (
        <div style={{ position: 'relative', top: '-100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', padding: 8, borderRadius: 6, fontSize: 12 }}>No locations to display</div>
        </div>
      )}
    </div>
  )
}
