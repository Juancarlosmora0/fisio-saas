'use client'

import Link from 'next/link'
import LogoutButton from '@/components/layout/LogoutButton'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/pacientes', icon: '👤', label: 'Pacientes' },
  { href: '/facturacion', icon: '💳', label: 'Facturación' },
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/lista-espera', icon: '⏳', label: 'Lista de espera' },
  { href: '/ajustes', icon: '⚙️', label: 'Ajustes' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-sm">ClinicAllyPro</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const activo = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activo
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}