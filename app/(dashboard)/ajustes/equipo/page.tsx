import { createClient } from '@/lib/supabase/server'

export default async function EquipoPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/ajustes" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
          ← Volver a ajustes
        </a>
        <h1 className="text-2xl font-semibold text-slate-900 mt-4">Equipo</h1>
        <p className="text-slate-500 mt-1">{users?.length ?? 0} miembros activos</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {users?.map((user) => (
          <div key={user.id} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              {user.role === 'admin' ? 'Admin' :
               user.role === 'physio' ? 'Fisioterapeuta' : 'Recepción'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}