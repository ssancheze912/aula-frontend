import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">StudyRoom</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Ver perfil"
          >
            {profile?.firstName} {profile?.lastName}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <section aria-label="Tus salas de estudio">
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">Aún no tienes salas de estudio.</p>
            <p className="text-sm">— Gestión de salas implementada en Sprint 2 —</p>
          </div>
        </section>
      </div>
    </main>
  )
}
