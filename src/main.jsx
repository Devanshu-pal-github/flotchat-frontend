import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './styles/globals.css'

const root = createRoot(document.getElementById('root'))
const queryClient = new QueryClient()

// Theme with requested palette: #F5EFE6, #E8DFCA, #6D94C5, #CBDCEB
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F5EFE6',
      paper: '#FFFFFF',
    },
    primary: { main: '#6D94C5', contrastText: '#ffffff' },
    secondary: { main: '#CBDCEB', contrastText: '#0a1a2b' },
    text: { primary: '#1e293b', secondary: '#475569' },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { background: '#6D94C5' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
})

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
