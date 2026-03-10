import { createClient } from '@/lib/supabase/server'
import AccionesEstadoCita from '@/components/layout/AccionesEstadoCita'
import AlertaRiesgo from '@/components/layout/AlertaRiesgo'

export default async function DetalleCitaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, patients(full_name, email, phone), users(full_name)`)
    .eq('id', id)
    .single()

  if (!cita) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Cita no encontrada.</p>
      </div>
    )
  }

  const { data: riesgo } = await supabase
    .from('patient_cancellation_risk')
    .select('*')
    .eq('id', cita.patient_id)
    .single()

  const estadoLabel: Record<string, string> = {
    scheduled: '🕐 Programada',
    confirmed: '✅ Confirmada',
    completed: '🏁 Completada',
    cancelled: '❌ Cancelada',
    no_show: '👻 No-show',
  }

  const estadoColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/agenda" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
          ← Volver a la agenda
        </a>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Detalle de cita</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${estadoColor[cita.status]}`}>
          {estadoLabel[cita.status]}
        </span>
      </div>

      {riesgo && (
        <AlertaRiesgo
          totalCancelaciones={riesgo.total_cancelaciones}
          nivelRiesgo={riesgo.nivel_riesgo}
          porcentajeCancelacion={riesgo.porcentaje_cancelacion}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Información</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Paciente</p>
            <p className="text-sm text-slate-900">{cita.patients?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Fisioterapeuta</p>
            <p className="text-sm text-slate-900">{cita.users?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Fecha y hora</p>
            <p className="text-sm text-slate-900">
              {new Date(cita.starts_at).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long'
              })} · {new Date(cita.starts_at).toLocaleTimeString('es-ES', {
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Duración</p>
            <p className="text-sm text-slate-900">{cita.duration_minutes} minutos</p>
          </div>
          {cita.notes && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400 mb-1">Notas</p>
              <p className="text-sm text-slate-900">{cita.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Cambiar estado</h2>
        <AccionesEstadoCita citaId={cita.id} estadoActual={cita.status} pacienteEmail={cita.patients?.email} />
      </div>
    </div>
  )
}