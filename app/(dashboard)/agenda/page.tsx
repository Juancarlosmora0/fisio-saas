import Link from 'next/link'
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
    .select(`*, patients(full_name), users(full_name)`)
    .gte('starts_at', startOfWeek.toISOString())
    .lte('starts_at', endOfWeek.toISOString())
    .order('starts_at')

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  const estadoConfig: Record<string, { bg: string; border: string; texto: string; badge: string; badgeTexto: string }> = {
    scheduled:  { bg: 'bg-blue-50',   border: 'border-blue-100',   texto: 'text-blue-900',   badge: 'bg-blue-200',   badgeTexto: '🕐 Programada' },
    confirmed:  { bg: 'bg-green-50',  border: 'border-green-100',  texto: 'text-green-900',  badge: 'bg-green-200',  badgeTexto: '✅ Confirmada' },
    completed:  { bg: 'bg-slate-50',  border: 'border-slate-200',  texto: 'text-slate-500',  badge: 'bg-slate-200',  badgeTexto: '🏁 Completada' },
    cancelled:  { bg: 'bg-red-50',    border: 'border-red-100',    texto: 'text-red-900',    badge: 'bg-red-200',    badgeTexto: '❌ Cancelada' },
    no_show:    { bg: 'bg-orange-50', border: 'border-orange-100', texto: 'text-orange-900', badge: 'bg-orange-200', badgeTexto: '👻 No-show' },
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Agenda</h1>
          <p className="text-slate-500 mt-1">Semana actual</p>
        </div>
        <Link
          href="/agenda/nueva-cita"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva cita
        </Link>
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
            <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className={`px-4 py-3 border-b border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {day}
                </p>
                <div className="flex items-center justify-between">
                  <p className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                    {dayDate.getDate()}
                  </p>
                  <span className="text-xs text-slate-400">{dayAppointments?.length ?? 0} citas</span>
                </div>
              </div>

              <div className="p-3 space-y-2 overflow-y-auto max-h-96">
                {dayAppointments?.length === 0 && (
                  <p className="text-xs text-slate-300 text-center mt-4">Sin citas</p>
                )}
                {dayAppointments?.map(apt => {
                  const config = estadoConfig[apt.status] ?? estadoConfig.scheduled
                  return (
                    <Link
                      key={apt.id}
                      href={`/agenda/${apt.id}`}
                      className={`block p-2.5 rounded-lg border ${config.bg} ${config.border} hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold ${config.texto}`}>
                          {new Date(apt.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.badge} ${config.texto}`}>
                          {config.badgeTexto}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${config.texto}`}>
                        {apt.patients?.full_name ?? 'Sin paciente'}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}