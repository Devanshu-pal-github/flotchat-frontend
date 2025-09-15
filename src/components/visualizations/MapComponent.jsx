import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapComponent({ data = [], selectedVariable = 'temperature', onFloatSelect = ()=>{}, height = 360 }) {
  const center = [20.5937, 78.9629] // India approx
  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
    </div>
  )
}
