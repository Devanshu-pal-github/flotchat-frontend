import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import HomePage from './pages/HomePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import SidebarLayout from './components/common/SidebarLayout.jsx'

export default function App() {
  return (
    <>
      <CssBaseline />
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SidebarLayout>
    </>
  )
}
