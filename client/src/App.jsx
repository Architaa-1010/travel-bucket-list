import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Map from './pages/Map'
import Stats from './pages/Stats'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
    </Routes>
  )
}

export default App