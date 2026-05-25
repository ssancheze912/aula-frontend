import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
        <p className="text-gray-500 mb-4">— Implementado en Sprint 2 —</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← Volver al dashboard
        </button>
      </div>
    </main>
  )
}
