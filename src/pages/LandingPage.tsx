import { Link, Navigate } from 'react-router-dom'
import AulaLogoMark from '../components/AulaLogoMark'
import { useAuth } from '../contexts/AuthContext'

const CREAM = '#fbf7ee'
const DARK_GREEN = '#0f3a26'
const ACCENT_GREEN = '#1a8454'
const CORAL = '#c95636'

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeadingUnderline() {
  return (
    <svg
      className="absolute left-0 right-0"
      style={{ top: '100%', height: '14px', marginTop: '-4px' }}
      viewBox="0 0 266.547 14.7969"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3.06078 10.3578C30.6817 5.42553 59.289 5.42553 88.8828 10.3578C118.477 15.2901 148.07 15.2901 177.664 10.3578C207.258 5.42553 235.865 5.42553 263.486 10.3578"
        stroke="#E89070"
        strokeWidth="3.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LetterAvatar({ letter, bg }: { letter: string; bg: string }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white"
      style={{
        backgroundColor: bg,
        width: '46px',
        height: '46px',
        border: `3px solid ${CREAM}`,
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        fontSize: '14px',
      }}
    >
      {letter}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect
        x="1"
        y="5"
        width="15"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ScreenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 11l3-3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M16 20c0-2.2 2.2-4 5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  iconBg: string
  iconColor: string
}) {
  return (
    <article
      className="bg-white flex flex-col"
      style={{
        borderRadius: '24px',
        padding: '24px',
        boxShadow:
          '0px 6px 7px rgba(26, 31, 24, 0.1), 0px 2px 2px rgba(26, 31, 24, 0.06)',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: iconBg,
          borderRadius: '16px',
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <h3
        className="mt-5"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: '18px',
          lineHeight: '27px',
          color: '#1a1f18',
        }}
      >
        {title}
      </h3>
      <p
        className="mt-2"
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '22.4px',
          color: '#6e6b5e',
        }}
      >
        {description}
      </p>
    </article>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: '#1f4023',
        borderRadius: '24px',
        padding: '32px',
        minHeight: '252px',
      }}
    >
      <div
        style={{
          color: '#4f8e4a',
          fontFamily: "'Sora', sans-serif",
          fontWeight: 800,
          fontSize: '40px',
          lineHeight: '60px',
          opacity: 0.6,
        }}
      >
        {number}
      </div>
      <h3
        className="mt-4"
        style={{
          color: '#fbf7ee',
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: '20px',
          lineHeight: '30px',
        }}
      >
        {title}
      </h3>
      <p
        className="mt-2.5"
        style={{
          color: '#8fbe83',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '15px',
          lineHeight: '24px',
        }}
      >
        {description}
      </p>
    </div>
  )
}

function HeroMockup() {
  return (
    <div className="relative w-full max-w-[420px]" aria-hidden="true">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">En vivo</span>
          </div>
          <span className="text-xs text-gray-400">3 participantes</span>
        </div>
        <h4 className="text-sm font-bold text-gray-900 mb-1">Cálculo II — Parcial</h4>
        <p className="text-xs text-gray-500 mb-3">Repaso de límites y derivadas</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['bg-emerald-200', 'bg-orange-200', 'bg-yellow-200'].map((c, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg ${c} flex items-center justify-center text-xs font-semibold text-gray-700`}
            >
              {['LM', 'JR', 'AS'][i]}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-300 flex-shrink-0" />
            <div className="bg-gray-100 rounded-xl px-3 py-1.5 text-xs text-gray-700">
              ¿Alguien entendió el ejercicio 4?
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <div
              className="rounded-xl px-3 py-1.5 text-xs text-white"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              Yo voy escribiendo la solución
            </div>
            <div className="w-6 h-6 rounded-full bg-orange-300 flex-shrink-0" />
          </div>
        </div>
      </div>
      <div
        className="absolute -top-4 -left-6 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100 hidden md:flex items-center gap-2"
      >
        <div className="flex -space-x-2">
          {['bg-emerald-300', 'bg-orange-300', 'bg-purple-300'].map((c, i) => (
            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${c}`} />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-700">+12 estudiando</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{ backgroundColor: CREAM }}
        className="min-h-screen"
        aria-busy="true"
        aria-live="polite"
      />
    )
  }

  if (user && profile) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div
      style={{ backgroundColor: CREAM, isolation: 'isolate' }}
      className="min-h-screen relative"
    >
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <a
          href="#main-content"
          className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          <AulaLogoMark size={32} />
          <span className="text-xl font-bold text-gray-900">
            aula<span style={{ color: CORAL }}>.</span>
          </span>
        </a>
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-8">
          <a
            href="#funciones"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            Funciones
          </a>
          <a
            href="#como-funciona"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            Cómo funciona
          </a>
          <Link
            to="/login"
            className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            Iniciar sesión
          </Link>
        </nav>
        <Link
          to="/register"
          className="text-sm font-semibold text-white px-5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          style={{ backgroundColor: ACCENT_GREEN }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = DARK_GREEN)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT_GREEN)}
        >
          Registrarse
        </Link>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden">
          <div
            className="fixed rounded-full pointer-events-none"
            style={{
              backgroundColor: '#b9d5b0',
              width: '600px',
              height: '600px',
              left: '-128px',
              top: '-128px',
              opacity: 0.5,
              filter: 'blur(80px)',
              zIndex: -1,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full pointer-events-none hidden lg:block"
            style={{
              backgroundColor: '#fbefc2',
              width: '500px',
              height: '500px',
              left: '60%',
              top: '344px',
              opacity: 0.5,
              filter: 'blur(80px)',
            }}
            aria-hidden="true"
          />

          <div className="relative px-6 lg:px-16 pt-12 pb-24 max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap gap-3">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#dcead7' }}
                >
                  <span
                    style={{
                      color: '#2e5f30',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      fontSize: '12px',
                      lineHeight: '16px',
                    }}
                  >
                    ✨ Beta abierta · gratis para estudiantes
                  </span>
                </div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#f4ecdc', color: '#5c4e32' }}
                >
                  <CheckIcon />
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
                    }}
                  >
                    Experiencia accesible
                  </span>
                </div>
              </div>

              <h1
                className="flex flex-col"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(44px, 6.5vw, 72px)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.035em',
                  color: '#1a1f18',
                }}
              >
                <span>
                  Estudia con{' '}
                  <span className="relative inline-block">
                    <span style={{ color: ACCENT_GREEN }}>tu gente</span>
                    <HeadingUnderline />
                  </span>
                  ,
                </span>
                <span>en vivo.</span>
              </h1>

              <p
                className="max-w-xl"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '18px',
                  lineHeight: '28.8px',
                  color: '#6e6b5e',
                }}
              >
                aula es tu sala de estudio digital: chat, video, pizarra y pantalla compartida para
                grupos universitarios. Gratuita para toda la comunidad académica.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  style={{
                    backgroundColor: ACCENT_GREEN,
                    color: '#fff',
                    padding: '14px 24px',
                    borderRadius: '16px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '17px',
                    lineHeight: '25.5px',
                    boxShadow: '0px 2px 0px #2e5f30',
                  }}
                >
                  Registrarse
                </Link>
                <Link
                  to="/login"
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  style={{
                    border: '1px solid rgba(26, 31, 24, 0.18)',
                    color: '#1a1f18',
                    padding: '14px 24px',
                    borderRadius: '16px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '17px',
                    lineHeight: '25.5px',
                  }}
                >
                  Iniciar sesión
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <LetterAvatar letter="S" bg="#4f8e4a" />
                  <LetterAvatar letter="M" bg="#8fbe83" />
                  <LetterAvatar letter="C" bg="#c95636" />
                  <LetterAvatar letter="D" bg="#4e89a8" />
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#dedacb',
                      width: '40px',
                      height: '40px',
                      border: `3px solid ${CREAM}`,
                      color: '#3f4138',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      fontSize: '12.8px',
                    }}
                  >
                    +2396
                  </div>
                </div>
                <span
                  style={{
                    color: '#6e6b5e',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '21px',
                  }}
                >
                  2.400+ estudiantes ya están estudiando
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroMockup />
            </div>
          </div>
        </section>

        <section
          id="funciones"
          className="px-6 lg:px-16 max-w-7xl mx-auto"
          style={{ paddingTop: '96px', paddingBottom: '64px' }}
        >
          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <p
              className="uppercase"
              style={{
                color: '#4f8e4a',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '1.44px',
                lineHeight: '18px',
              }}
            >
              Funciones
            </p>
            <h2
              style={{
                color: '#1a1f18',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '38px',
                lineHeight: '1.05',
                letterSpacing: '-0.95px',
              }}
            >
              Todo lo que necesitas para estudiar juntos
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ChatIcon />}
              iconBg="#dcead7"
              iconColor="#1f4023"
              title="Chat en tiempo real"
              description="Mensajes, reacciones y archivos compartidos al instante con tu sala."
            />
            <FeatureCard
              icon={<VideoIcon />}
              iconBg="#dce9f0"
              iconColor="#2a5f7f"
              title="Videollamadas HD"
              description="Video y audio cristalinos para estudiar cara a cara desde cualquier lugar."
            />
            <FeatureCard
              icon={<ScreenIcon />}
              iconBg="#fbefc2"
              iconColor="#8a6d1e"
              title="Comparte tu pantalla"
              description="Muéstrale a tu sala lo que estás haciendo, sin fricción."
            />
            <FeatureCard
              icon={<GroupIcon />}
              iconBg="#dcead7"
              iconColor="#1f4023"
              title="Salas de grupo"
              description="Crea tu sala en segundos e invita a tu gente con un solo link."
            />
            <FeatureCard
              icon={<HistoryIcon />}
              iconBg="#dce9f0"
              iconColor="#2a5f7f"
              title="Historial guardado"
              description="Todo queda registrado: apuntes, pizarras y grabaciones de sesión."
            />
          </div>
        </section>

        <section id="como-funciona" className="px-6 lg:px-8 py-4">
          <div
            className="max-w-7xl mx-auto"
            style={{
              backgroundColor: '#122816',
              borderRadius: '40px',
            }}
          >
            <div className="pt-24 pb-24 px-6 sm:px-10 lg:px-16">
              <div className="flex flex-col items-center text-center mb-16 gap-3">
                <p
                  className="uppercase"
                  style={{
                    color: '#8fbe83',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '1.44px',
                    lineHeight: '18px',
                  }}
                >
                  Cómo funciona
                </p>
                <h2
                  style={{
                    color: '#fbf7ee',
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '38px',
                    lineHeight: '1.05',
                  }}
                >
                  Empezá a estudiar en 3 pasos
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <StepCard
                  number="01"
                  title="Crea tu sala"
                  description="Ponle nombre, elige si es privada o pública y elige las herramientas que necesitas."
                />
                <StepCard
                  number="02"
                  title="Invita a tu gente"
                  description="Comparte el link con tus compas. Sin cuentas, sin contraseñas complicadas."
                />
                <StepCard
                  number="03"
                  title="Estudia en vivo"
                  description="Chat, video, pizarra y pantalla compartida, todo en un solo lugar."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
          <div
            className="relative overflow-hidden"
            style={{
              backgroundColor: CORAL,
              borderRadius: '36px',
              minHeight: '360px',
            }}
          >
            <div className="relative z-10 p-10 lg:p-16 max-w-[600px]">
              <h2
                className="text-white mb-7"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  fontSize: '38px',
                  lineHeight: '1.2',
                }}
              >
                ¿Lista para estudiar con tu gente?
              </h2>
              <p
                className="mb-7"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '18px',
                  lineHeight: '27px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Gratuita para toda la comunidad universitaria latinoamericana.
              </p>
              <Link
                to="/register"
                className="inline-block bg-white border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: '#d7c59a',
                  borderRadius: '16px',
                  padding: '14px 30px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '17px',
                  color: '#1a1f18',
                }}
              >
                Registrarse ahora
              </Link>
            </div>
            <div
              className="absolute pointer-events-none hidden md:flex items-center justify-center"
              style={{
                right: '6%',
                top: '50%',
                transform: 'translateY(-50%) rotate(-12deg)',
                width: '240px',
                height: '240px',
                opacity: 0.2,
              }}
              aria-hidden="true"
            >
              <svg
                width="200"
                height="132"
                viewBox="0 0 175.005 115.005"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M157.505 17.5C157.505 61.685 126.165 97.5 87.5047 97.5C70.0047 97.5 40.0047 87.5 27.5047 67.5L17.5047 97.5"
                  stroke="white"
                  strokeWidth="35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="px-6 lg:px-16 pt-16 pb-10"
        style={{ backgroundColor: '#1a1f18', fontFamily: "'Nunito', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-1 max-w-[180px]">
              <div
                className="flex items-center gap-2 mb-4"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <AulaLogoMark size={32} color="#8fbe83" />
                <span
                  className="text-[22px] font-semibold"
                  style={{ color: '#fbf7ee' }}
                >
                  aula<span style={{ color: CORAL }}>.</span>
                </span>
              </div>
              <p
                className="text-sm leading-[22.4px]"
                style={{ color: '#6e6b5e' }}
              >
                La sala de estudio digital para estudiantes universitarios latinoamericanos.
              </p>
            </div>
            <FooterColumn
              title="Producto"
              links={['Funciones', 'Cómo funciona', 'Changelog', 'Accesibilidad']}
            />
            <FooterColumn
              title="Comunidad"
              links={['Blog', 'Discord', 'Twitter', 'Newsletter']}
            />
            <FooterColumn
              title="Recursos"
              links={['Guía de inicio', 'API', 'Integraciones', 'Status']}
            />
            <FooterColumn
              title="Empresa"
              links={['Sobre nosotros', 'Privacidad', 'Términos', 'Contacto']}
            />
          </div>

          <div
            className="mt-16 pt-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div className="max-w-[480px] flex flex-col gap-2">
              <p
                className="text-[13px] leading-[19.5px]"
                style={{ color: '#6e6b5e' }}
              >
                © {new Date().getFullYear()} aula. Hecho con ☕ en Latinoamérica.
              </p>
              <p
                className="text-xs leading-[19.2px]"
                style={{ color: '#3f4138' }}
              >
                Experiencia pensada para navegación clara, controles descriptivos y compatibilidad
                futura con lector de pantalla.
              </p>
            </div>
            <ul className="flex items-center gap-6">
              {['Privacidad', 'Términos', 'Accesibilidad'].map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className="text-[13px] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
                    style={{ color: '#6e6b5e' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3
        className="text-[13px] font-bold uppercase mb-4"
        style={{
          color: '#dedacb',
          letterSpacing: '0.65px',
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <button
              type="button"
              className="text-sm text-left hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded transition-colors"
              style={{ color: '#6e6b5e' }}
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
