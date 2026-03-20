import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute    from './components/PublicRoute'

import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Sites      from './pages/Sites'
import Guards     from './pages/Guards'
import Incidents  from './pages/Incidents'
import Scheduling from './pages/Scheduling'
import Reports    from './pages/Reports'
import Clients    from './pages/Clients'
import Settings   from './pages/Settings'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/sites"      element={<ProtectedRoute><Sites /></ProtectedRoute>} />
      <Route path="/guards"     element={<ProtectedRoute><Guards /></ProtectedRoute>} />
      <Route path="/incidents"  element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
      <Route path="/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
      <Route path="/reports"    element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/clients"    element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
