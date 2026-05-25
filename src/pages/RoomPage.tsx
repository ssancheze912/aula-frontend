import { useParams, useNavigate } from 'react-router-dom'

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-2">Sala</h1>
      <p className="text-gray-400 mb-2">ID: <code>{roomId}</code></p>
      <p className="text-gray-500 mb-6">— Implementado en Sprints 3–5 —</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        ← Volver al dashboard
      </button>
    </main>
  )
}
