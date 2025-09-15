import React, { useMemo, useState } from 'react'
import { Grid, Paper, Typography, Divider, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, Button, Alert, MenuItem } from '@mui/material'
import MapComponent from '../components/visualizations/MapComponent.jsx'
import ProfileChart from '../components/visualizations/ProfileChart.jsx'
import { useArgoProfiles } from '../hooks/useDataQuery.js'
import { api } from '../services/api.js'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [region, setRegion] = useState('')
  const [limit, setLimit] = useState(200)
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

  // Map requires lat/lon keys named lat/lon
  const mapData = useMemo(() => {
    if (!profiles.length) return []
    return profiles.map(p => ({ id: `${p.platform_number}-${p.cycle_number}`, lat: p.latitude, lon: p.longitude }))
  }, [profiles])

  const dummyProfile = {
    depth: [0, 50, 100, 200, 500, 1000],
    temperature: [28, 27, 25, 20, 10, 5],
    salinity: [35, 35.1, 35.2, 35.3, 35.0, 34.8]
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="h5">Interactive Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Loading profiles…' : `Profiles: ${profiles.length}${stats ? ` • Total profiles: ${stats.profiles} • Floats: ${stats.floats}` : ''}`}
            </Typography>
          </div>
          <Stack direction="row" spacing={1}>
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
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Float locations</Typography>
          <Divider sx={{ mb: 1 }} />
          <MapComponent data={mapData} selectedVariable="temperature" onFloatSelect={(id)=>console.log('float', id)} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Sample profile (placeholder)</Typography>
          <Divider sx={{ mb: 1 }} />
          <ProfileChart data={dummyProfile} variable="temperature" showDepth={true} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Recent profiles</Typography>
          <Divider sx={{ mb: 1 }} />
          <Table size="small">
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
              {(profiles || []).slice(0, 10).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.platform_number}</TableCell>
                  <TableCell>{p.cycle_number}</TableCell>
                  <TableCell>{p.ocean_region || '-'}</TableCell>
                  <TableCell>{p.latitude.toFixed(2)}</TableCell>
                  <TableCell>{p.longitude.toFixed(2)}</TableCell>
                  <TableCell>{p.profile_date ? new Date(p.profile_date).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
              {!profiles?.length && (
                <TableRow>
                  <TableCell colSpan={6}>No profiles found. Try seeding the database.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}
