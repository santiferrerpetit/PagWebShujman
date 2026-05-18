export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
          Gestión Integral de Clubes
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Administra tu club de manera eficiente. Simplifica la gestión de socios, actividades y recursos en una sola plataforma.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a 
            href="/auth/login" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105"
          >
            Iniciar Sesión
          </a>
          <a 
            href="/auth/register" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all duration-300 hover:scale-105"
          >
            Registrarse
          </a>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Gestión de Socios</h3>
          <p className="text-slate-400">Administra la membresía y datos de tus socios de forma sencilla.</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Actividades</h3>
          <p className="text-slate-400">Organiza y programa actividades, eventos y reuniones del club.</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Reportes</h3>
          <p className="text-slate-400">Visualiza estadísticas y genera reportes de la gestión del club.</p>
        </div>
      </div>
    </div>
  );
}
