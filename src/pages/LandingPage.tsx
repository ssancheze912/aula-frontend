import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">StudyRoom</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Salón de estudio colaborativo en tiempo real. Estudia con tus compañeros desde cualquier lugar.
      </p>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Crear cuenta
        </Link>
        <Link
          to="/login"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}
