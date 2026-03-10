import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
  inicioSemana.setHours(0, 0, 0, 0)

  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)
  finSemana.setHours(23, 59, 59, 999)

  const { data: citasSemana } = await supabase
    .from('appointments')
    .select(`*, patients(full_name)`)
    .gte('starts_at', inicioSemana.toISOString())
    .lte('starts_at', finSemana.toISOString())

  const hoyInicio = new Date()
  hoyInicio.setHours(0, 0, 0, 0)
  const hoyFin = new Date()
  hoyFin.setHours(23, 59, 59, 999)

  const { data: citasHoy } = await supabase
    .from('appointments')
    .select(`*, patients(full_name)`)
    .gte('starts_at', hoyInicio.toISOString())
    .lte('starts_at', hoyFin.toISOString())
    .order('starts_at')

  const { data: listaEspera } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('status', 'waiting')

  const { data: pacientesRiesgo } = await supabase
    .from('patient_cancellation_risk')
    .select('*')
    .in('nivel_riesgo', ['alto', 'medio'])

  const total = citasSemana?.length ?? 0
  const canceladas = citasSemana?.filter(c => c.status === 'cancelled') ?? []
  const noShows = citasSemana?.filter(c => c.status === 'no_show') ?? []
  const completadas = citasSemana?.filter(c => c.status === 'completed').length ?? 0
  const confirmadas = citasSemana?.filter(c => c.status === 'confirmed').length ?? 0
  const tasaCancelacion = total > 0 ? Math.round((canceladas.length + noShows.length) / total * 100) : 0
  const ocupacion = total > 0 ? Math.round((completadas + confirmadas) / total * 100) : 0
  const perdidaEstimada = (canceladas.length + noShows.length) * 45
  const citasConPerdida = [...canceladas, ...noShows]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de la semana actual</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Citas esta semana */}
        <div className="rounded-2xl p-5 bg-blue-50 text-blue-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">📅</span>
            <span className="text-2xl font-bold">{total}</span>
          </div>
          <p className="text-sm font-medium">Citas esta semana</p>
          <p className="text-xs opacity-70 mt-0.5">{completadas + confirmadas} activas</p>
        </div>

        {/* Tasa cancelación */}
        <div className={`rounded-2xl p-5 ${tasaCancelacion > 15 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">❌</span>
            <span className="text-2xl font-bold">{tasaCancelacion}%</span>
          </div>
          <p className="text-sm font-medium">Tasa de cancelación</p>
          <p className="text-xs opacity-70 mt-0.5">{canceladas.length} canceladas · {noShows.length} no-shows</p>
        </div>

        {/* Ocupación */}
        <div className={`rounded-2xl p-5 ${ocupacion > 70 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">📊</span>
            <span className="text-2xl font-bold">{ocupacion}%</span>
          </div>
          <p className="text-sm font-medium">Ocupación agenda</p>
          <p className="text-xs opacity-70 mt-0.5">{ocupacion > 70 ? 'Buena ocupación' : 'Mejorable'}</p>
        </div>

        {/* Pérdida estimada — INTERACTIVA */}
        <details className={`rounded-2xl p-5 cursor-pointer ${perdidaEstimada > 200 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
          <summary className="list-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">💸</span>
              <span className="text-2xl font-bold">{perdidaEstimada}€</span>
            </div>
            <p className="text-sm font-medium">Pérdida estimada</p>
            <p className="text-xs opacity-70 mt-0.5">Por cancelaciones · clic para ver detalle</p>
          </summary>
          <div className="mt-4 space-y-2 border-t border-current border-opacity-20 pt-4">
            {citasConPerdida.length === 0 && (
              <p className="text-xs opacity-60">No hay pérdidas esta semana</p>
            )}
            {citasConPerdida.map(cita => (
              <a key={cita.id} href={`/agenda/${cita.id}`} className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg px-3 py-2 hover:bg-opacity-80 transition-all">
                <div>
                  <p className="text-xs font-medium">{cita.patients?.full_name ?? '—'}</p>
                  <p className="text-xs opacity-60">
                    {new Date(cita.starts_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' })}
                    {' · '}
                    {new Date(cita.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
                  </p>
                </div>
                <span className="text-xs font-semibold">-45€</span>
              </a>
            ))}
          </div>
        </details>

        {/* Lista de espera — LINK DIRECTO */}
        <a href="/lista-espera" className="rounded-2xl p-5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">⏳</span>
            <span className="text-2xl font-bold">{listaEspera?.length ?? 0}</span>
          </div>
          <p className="text-sm font-medium">Lista de espera</p>
          <p className="text-xs opacity-70 mt-0.5">Clic para gestionar →</p>
        </a>

        {/* Pacientes en riesgo — INTERACTIVA */}
        <details className={`rounded-2xl p-5 cursor-pointer ${(pacientesRiesgo?.length ?? 0) > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <summary className="list-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">⚠️</span>
              <span className="text-2xl font-bold">{pacientesRiesgo?.length ?? 0}</span>
            </div>
            <p className="text-sm font-medium">Pacientes en riesgo</p>
            <p className="text-xs opacity-70 mt-0.5">Clic para ver detalle</p>
          </summary>
          <div className="mt-4 space-y-2 border-t border-current border-opacity-20 pt-4">
            {pacientesRiesgo?.length === 0 && (
              <p className="text-xs opacity-60">No hay pacientes en riesgo</p>
            )}
            {pacientesRiesgo?.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-medium">{p.full_name}</p>
                  <p className="text-xs opacity-60">{p.total_cancelaciones} cancelaciones · {p.porcentaje_cancelacion}%</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.nivel_riesgo === 'alto' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                  {p.nivel_riesgo === 'alto' ? '🔴 Alto' : '🟠 Medio'}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">📅 Citas de hoy</h2>
          {citasHoy?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay citas hoy</p>
          )}
          <div className="space-y-3">
            {citasHoy?.map(cita => (
              <a key={cita.id} href={`/agenda/${cita.id}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{cita.patients?.full_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(cita.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  cita.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  cita.status === 'completed' ? 'bg-slate-200 text-slate-600' :
                  cita.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  cita.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {cita.status === 'confirmed' ? '✅ Confirmada' :
                   cita.status === 'completed' ? '🏁 Completada' :
                   cita.status === 'cancelled' ? '❌ Cancelada' :
                   cita.status === 'no_show' ? '👻 No-show' :
                   '🕐 Programada'}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Pacientes en riesgo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">⚠️ Pacientes en riesgo</h2>
          {pacientesRiesgo?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay pacientes en riesgo</p>
          )}
          <div className="space-y-3">
            {pacientesRiesgo?.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.full_name}</p>
                  <p className="text-xs text-slate-400">{p.total_cancelaciones} cancelaciones · {p.porcentaje_cancelacion}% de sus citas</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  p.nivel_riesgo === 'alto' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {p.nivel_riesgo === 'alto' ? '🔴 Alto' : '🟠 Medio'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}