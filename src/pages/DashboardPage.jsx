import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Grid, Paper, Typography, Divider, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, Button, Alert, MenuItem, Snackbar, Chip } from '@mui/material'
import MapComponent from '../components/visualizations/MapComponent.jsx'
import ProfileChart from '../components/visualizations/ProfileChart.jsx'
import ChatInterface from '../components/chat/ChatInterface.jsx'
import { useArgoProfiles, useProfileMeasurements } from '../hooks/useDataQuery.js'
import { api } from '../services/api.js'
import { useQuery } from '@tanstack/react-query'

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function DashboardPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [region, setRegion] = useState('')
  const [limit, setLimit] = useState(200)
  const [selectedId, setSelectedId] = useState(null)
  const [errorOpen, setErrorOpen] = useState(false)
  const tableRef = useRef(null)

  // Fetch profiles within broad bounds
  const filterParams = useMemo(() => {
    const p = { lat_min: -90, lat_max: 90, lon_min: -180, lon_max: 180, limit }
    if (start) p.start_date = start
    if (end) p.end_date = end
    if (region) p.ocean_region = region
    return p
  }, [start, end, region, limit])
  const { data: profiles = [], isLoading, isError, refetch } = useArgoProfiles(filterParams)
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/argo/stats')).data,
    staleTime: 60_000
  })

  useEffect(() => { if (isError) setErrorOpen(true) }, [isError])

  const selectedProfile = useMemo(() => profiles.find(p => p.id === selectedId) || null, [profiles, selectedId])
  const { data: measurements } = useProfileMeasurements(selectedId)

  // Map requires lat/lon keys named lat/lon
  const mapData = useMemo(() => {
    if (!profiles.length) return []
    // Keep a human-readable label id but carry unique pid for React keys and selection
    return profiles.map(p => ({ id: `${p.platform_number}-${p.cycle_number}`, lat: p.latitude, lon: p.longitude, pid: p.id }))
  }, [profiles])

  const handleFloatSelect = (idOrKey) => {
    // Map now passes DB id (pid) for unambiguous selection
    const found = profiles.find(p => p.id === idOrKey)
    if (found) setSelectedId(found.id)
  }

  const handleMapClick = (latlng) => {
    if (!profiles.length) return
    let best = null
    let bestD = Infinity
    for (const p of profiles) {
      const d = haversine(latlng.lat, latlng.lng, p.latitude, p.longitude)
      if (d < bestD) { bestD = d; best = p }
    }
    if (best) setSelectedId(best.id)
  }

  useEffect(() => {
    if (!selectedId || !tableRef.current) return
    const row = tableRef.current.querySelector(`[data-rowid="${selectedId}"]`)
    if (row && row.scrollIntoView) row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedId])

  const dummyProfile = {
    depth: [0, 50, 100, 200, 500, 1000],
    temperature: [28, 27, 25, 20, 10, 5],
    salinity: [35, 35.1, 35.2, 35.3, 35.0, 34.8]
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1}>
          <div>
            <Typography variant="h5">Interactive Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Loading profiles…' : `Profiles: ${profiles.length}${stats ? ` • Total profiles: ${stats.profiles} • Floats: ${stats.floats}` : ''}`}
            </Typography>
          </div>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <TextField size="small" type="date" label="Start" InputLabelProps={{ shrink: true }} value={start} onChange={(e)=>setStart(e.target.value)} />
            <TextField size="small" type="date" label="End" InputLabelProps={{ shrink: true }} value={end} onChange={(e)=>setEnd(e.target.value)} />
            <TextField size="small" select label="Region" value={region} onChange={(e)=>setRegion(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All regions</MenuItem>
              <MenuItem value="Indian">Indian</MenuItem>
              <MenuItem value="Arabian Sea">Arabian Sea</MenuItem>
              <MenuItem value="Bay of Bengal">Bay of Bengal</MenuItem>
              <MenuItem value="Pacific">Pacific</MenuItem>
              <MenuItem value="Atlantic">Atlantic</MenuItem>
            </TextField>
            <TextField size="small" type="number" label="Limit" value={limit} onChange={(e)=>setLimit(Number(e.target.value||0))} sx={{ width: 120 }} />
            <Button variant="contained" onClick={()=>refetch()} disabled={isLoading}>Apply</Button>
            <Button variant="outlined" onClick={async ()=>{
              const params = new URLSearchParams()
              if (start) params.set('start_date', start)
              if (end) params.set('end_date', end)
              if (region) params.set('ocean_region', region)
              params.set('limit', String(limit || 100))
              const res = await api.get(`/argo/export?${params.toString()}`, { responseType: 'blob' })
              const blob = new Blob([res.data], { type: 'text/csv' })
              const link = document.createElement('a')
              link.href = URL.createObjectURL(blob)
              link.download = 'argo_profiles.csv'
              document.body.appendChild(link)
              link.click()
              link.remove()
            }}>Export CSV</Button>
          </Stack>
        </Stack>
        {isError && <Alert severity="error" sx={{ mt: 1 }}>Failed to load profiles.</Alert>}
      </Grid>

      {/* Left: Map; Right: Chat (on md+). On mobile, stack. */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Float locations</Typography>
          <Divider sx={{ mb: 1 }} />
          <MapComponent data={mapData} selectedVariable="temperature" onFloatSelect={handleFloatSelect} onMapClick={handleMapClick} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <ChatInterface />
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1">Profile preview</Typography>
            {selectedProfile && (
              <Chip size="small" label={`${selectedProfile.platform_number} • Cycle ${selectedProfile.cycle_number}`} />
            )}
          </Stack>
          <Divider sx={{ mb: 1, mt: 1 }} />
          {!selectedProfile ? (
            <Typography variant="body2" color="text.secondary">Select a point on the map to preview a profile.</Typography>
          ) : !measurements ? (
            <Typography variant="body2" color="text.secondary">Loading measurements…</Typography>
          ) : measurements.depth?.length ? (
            <ProfileChart data={measurements} variable="temperature" showDepth={true} />
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No measurements available for this profile. Showing a sample for demonstration.
              </Typography>
              <ProfileChart data={dummyProfile} variable="temperature" showDepth={true} />
            </>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Recent profiles</Typography>
          <Divider sx={{ mb: 1 }} />
          <div ref={tableRef} style={{ maxHeight: 360, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell>Cycle</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(profiles || []).slice(0, 200).map((p) => {
                  const selected = p.id === selectedId
                  return (
                    <TableRow key={p.id} data-rowid={p.id} hover selected={selected} onClick={() => setSelectedId(p.id)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{p.platform_number}</TableCell>
                      <TableCell>{p.cycle_number}</TableCell>
                      <TableCell>{p.ocean_region || '-'}</TableCell>
                      <TableCell>{p.latitude.toFixed(2)}</TableCell>
                      <TableCell>{p.longitude.toFixed(2)}</TableCell>
                      <TableCell>{p.profile_date ? new Date(p.profile_date).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  )
                })}
                {!profiles?.length && (
                  <TableRow>
                    <TableCell colSpan={6}>No profiles found. Try adjusting filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Paper>
      </Grid>

      <Snackbar open={errorOpen} autoHideDuration={3000} onClose={() => setErrorOpen(false)} message="Failed to load profiles" />
    </Grid>
  )
}
