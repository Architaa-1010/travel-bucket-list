import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Auth from './pages/Auth'
import Map from './pages/Map'
import Stats from './pages/Stats'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import PublicProfile from './pages/PublicProfile'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={
          <PageTransition><Auth /></PageTransition>
        } />
        <Route path="/signup" element={
          <PageTransition><Auth /></PageTransition>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <PageTransition><Map /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute>
            <PageTransition><Stats /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/user/:username" element={
  <PageTransition><PublicProfile /></PageTransition>
} />
      </Routes>
    </AnimatePresence>
  )
}

export default App