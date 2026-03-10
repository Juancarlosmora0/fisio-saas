import { createClient } from '@/lib/supabase/server'

export default async function AgendaPage() {
  const supabase = await createClient()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(full_name),
      users(full_name)
    `)
    .gte('starts_at', startOfWeek.toISOString())
    .lte('starts_at', endOfWeek.toISOString())
    .order('starts_at')

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Agenda</h1>
          <p className="text-slate-500 mt-1">Semana actual</p>
        </div>
        <a href="/agenda/nueva-cita" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Nueva cita
        </a>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {days.map((day, index) => {
          const dayDate = new Date(startOfWeek)
          dayDate.setDate(startOfWeek.getDate() + index)

          const dayAppointments = appointments?.filter(apt => {
            const aptDate = new Date(apt.starts_at)
            return aptDate.toDateString() === dayDate.toDateString()
          })

          const isToday = dayDate.toDateString() === today.toDateString()

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Cabecera del día */}
              <div className={`px-4 py-3 border-b border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {day}
                </p>
                <p className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                  {dayDate.getDate()}
                </p>
              </div>

              {/* Citas del día */}
              <div className="p-3 space-y-2 min-h-32">
                {dayAppointments?.length === 0 && (
                  <p className="text-xs text-slate-300 text-center mt-4">Sin citas</p>
                )}
                {dayAppointments?.map(apt => (
                  <div
                    key={apt.id}
                    className="p-2.5 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <p className="text-xs font-medium text-blue-900">
                      {new Date(apt.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5 truncate">
                      {apt.patients?.full_name ?? 'Sin paciente'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}