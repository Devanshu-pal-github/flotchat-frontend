import React, { useState } from 'react'
import { Box, CssBaseline, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, useMediaQuery } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InfoIcon from '@mui/icons-material/Info'
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useLocation } from 'react-router-dom'

const drawerWidth = 220
const miniWidth = 64

export default function SidebarLayout({ children }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const items = [
    { key: 'home', label: 'Home', icon: <HomeIcon />, to: '/' },
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
    { key: 'about', label: 'About', icon: <InfoIcon />, to: '/about' },
  ]

  const content = (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ fontWeight: 700 }}>FloatChat</Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {items.map((it) => (
          <ListItemButton key={it.key} selected={pathname === it.to} onClick={() => { navigate(it.to); if (isMobile) setOpen(false) }}>
            <Tooltip title={hover || !isMobile ? '' : it.label} placement="right">
              <ListItemIcon>{it.icon}</ListItemIcon>
            </Tooltip>
            {(hover || !isMobile) && <ListItemText primary={it.label} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  // Drawer width behavior
  const width = (hover || isMobile) ? drawerWidth : miniWidth

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Permanent drawer on desktop, mini by default with hover expand */}
      {!isMobile && (
        <Drawer variant="permanent" open PaperProps={{ sx: { position: 'relative', overflowX: 'hidden', width, transition: 'width 200ms ease', '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } } }}>
          {content}
        </Drawer>
      )}

      {/* Temporary drawer on mobile */}
      {isMobile && (
        <Drawer variant="temporary" open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}>
          <Box sx={{ width: drawerWidth }}>{content}</Box>
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Top bar with menu button on mobile */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>
            <Box sx={{ ml: 1, fontWeight: 600 }}>FloatChat</Box>
          </Box>
        )}
        <Box sx={{ p: { xs: 1.5, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
