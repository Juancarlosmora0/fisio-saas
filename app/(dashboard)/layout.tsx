'use client'

import LogoutButton from '@/components/layout/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-sm">FisioFlow</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <a href="/agenda" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            📅 Agenda
          </a>
          <a href="/pacientes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            👤 Pacientes
          </a>
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            📊 Dashboard
          </a>
          <a href="/ajustes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            ⚙️ Ajustes
          </a>
        </nav>

        {/* Usuario */}
        <div className="p-3 border-t border-slate-100">
          <LogoutButton />
        </div>

      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}