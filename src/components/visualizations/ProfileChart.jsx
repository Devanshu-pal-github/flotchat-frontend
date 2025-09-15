import React from 'react'
import Plot from 'react-plotly.js'

export default function ProfileChart({ data, variable = 'temperature', showDepth = true }) {
  if (!data) return null
  const x = variable === 'temperature' ? data.temperature : data.salinity
  const y = data.depth
  return (
    <Plot
      data={[{
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#1976d2' },
      }]}
      layout={{
        autosize: true,
        height: 320,
        margin: { l: 50, r: 10, t: 10, b: 40 },
        xaxis: { title: variable === 'temperature' ? 'Temperature (°C)' : 'Salinity (PSU)' },
        yaxis: { title: 'Depth (m)', autorange: 'reversed', visible: showDepth },
      }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}
