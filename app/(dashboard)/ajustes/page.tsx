import { createClient } from '@/lib/supabase/server'

export default async function AjustesPage() {
  const supabase = await createClient()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
        <p className="text-slate-500 mt-1">Configuración de tu clínica</p>
      </div>

      {/* Datos de la clínica */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Datos de la clínica</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Nombre</p>
            <p className="text-sm text-slate-900">{clinic?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Email</p>
            <p className="text-sm text-slate-900">{clinic?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Teléfono</p>
            <p className="text-sm text-slate-900">{clinic?.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Dirección</p>
            <p className="text-sm text-slate-900">{clinic?.address ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Navegación a subsecciones */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <a href="/ajustes/equipo" className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-lg">👥</span>
            <div>
              <p className="text-sm font-medium text-slate-900">Equipo</p>
              <p className="text-xs text-slate-400">Gestiona fisioterapeutas y staff</p>
            </div>
          </div>
          <span className="text-slate-300">→</span>
        </a>
      </div>

    </div>
  )
}