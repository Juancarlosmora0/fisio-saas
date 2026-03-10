import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const { data: weekAppointments } = await supabase
    .from('appointments')
    .select('status, starts_at')
    .gte('starts_at', startOfWeek.toISOString())
    .lte('starts_at', endOfWeek.toISOString())

  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`*, patients(full_name), users(full_name)`)
    .gte('starts_at', new Date(today.setHours(0,0,0,0)).toISOString())
    .lte('starts_at', new Date(today.setHours(23,59,59,999)).toISOString())
    .order('starts_at')

  const { data: totalPatients } = await supabase
    .from('patients')
    .select('id', { count: 'exact' })
    .eq('is_active', true)

  const total = weekAppointments?.length ?? 0
  const cancelled = weekAppointments?.filter(a => a.status === 'cancelled').length ?? 0
  const completed = weekAppointments?.filter(a => a.status === 'completed').length ?? 0
  const occupancy = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    { label: 'Citas esta semana', value: total, icon: '📅', color: 'bg-blue-50 text-blue-600' },
    { label: 'Completadas', value: completed, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Canceladas', value: cancelled, icon: '❌', color: 'bg-red-50 text-red-600' },
    { label: 'Total pacientes', value: totalPatients?.length ?? 0, icon: '👤', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de la clínica</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Citas de hoy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Citas de hoy — {todayAppointments?.length ?? 0} citas
        </h2>

        {todayAppointments?.length === 0 ? (
          <p className="text-sm text-slate-400">No hay citas para hoy.</p>
        ) : (
          <div className="space-y-3">
            {todayAppointments?.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                <div className="text-sm font-medium text-slate-900 w-16">
                  {new Date(apt.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{apt.patients?.full_name ?? '—'}</p>
                  <p className="text-xs text-slate-400">{apt.users?.full_name ?? '—'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {apt.status === 'completed' ? 'Completada' :
                   apt.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}