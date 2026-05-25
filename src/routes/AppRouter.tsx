import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import AuthPage from '../pages/AuthPage'
import UsernameSetupPage from '../pages/UsernameSetupPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'
import RoomPage from '../pages/RoomPage'
import PrivateRoute from './PrivateRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/register/username" element={<UsernameSetupPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
