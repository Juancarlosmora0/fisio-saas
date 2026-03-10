import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import HistorialClinico from './HistorialClinico'

export default async function PacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: paciente } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!paciente) notFound()

  const { data: citas } = await supabase
    .from('appointments')
    .select(`*, users(full_name)`)
    .eq('patient_id', id)
    .order('starts_at', { ascending: false })

  const { data: registros } = await supabase
    .from('clinical_records')
    .select(`*, users(full_name)`)
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  const iniciales = paciente.full_name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/pacientes" className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">
        ← Volver
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
          {iniciales}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{paciente.full_name}</h1>
          <p className="text-slate-400 text-sm">Paciente activo · {citas?.length ?? 0} citas en total</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">👤 Datos personales</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{paciente.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Teléfono</p>
                <p className="text-sm text-slate-700">{paciente.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fecha de nacimiento</p>
                <p className="text-sm text-slate-700">{paciente.date_of_birth ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">📋 Valoración inicial</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Motivo de consulta</p>
                <p className="text-sm text-slate-700">{paciente.motivo_consulta ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Diagnóstico</p>
                <p className="text-sm text-slate-700">{paciente.diagnostico ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Objetivos</p>
                <p className="text-sm text-slate-700">{paciente.objetivos ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Antecedentes</p>
                <p className="text-sm text-slate-700">{paciente.antecedentes ?? '—'}</p>
              </div>
            </div>
            <Link
              href={`/pacientes/${id}/editar`}
              className="mt-4 block text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              ✏️ Editar valoración
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">📅 Historial de citas</h2>
            {citas?.length === 0 && <p className="text-xs text-slate-400">Sin citas registradas</p>}
            <div className="space-y-2">
              {citas?.slice(0, 8).map(cita => (
                <Link
                  key={cita.id}
                  href={`/agenda/${cita.id}`}
                  className="flex items-center justify-between hover:bg-slate-50 rounded-lg p-2 transition-colors"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      {new Date(cita.starts_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        timeZone: 'Europe/Madrid'
                      })}
                    </p>
                    <p className="text-xs text-slate-400">{cita.users?.full_name ?? '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cita.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    cita.status === 'completed' ? 'bg-slate-200 text-slate-600' :
                    cita.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    cita.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {cita.status === 'confirmed' ? 'Confirmada' :
                     cita.status === 'completed' ? 'Completada' :
                     cita.status === 'cancelled' ? 'Cancelada' :
                     cita.status === 'no_show' ? 'No-show' : 'Programada'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <HistorialClinico
            pacienteId={id}
            clinicId="76391f90-d92a-4768-8e2e-0de8c83ae7a1"
            registros={registros ?? []}
          />
        </div>
      </div>
    </div>
  )
}