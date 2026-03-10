import { createClient } from '@/lib/supabase/server'

export default async function FichaPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Paciente no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">

      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-8">
        <a href="/pacientes" className="text-slate-400 hover:text-slate-600 transition-colors">
          ← Volver
        </a>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-600">
          {patient.full_name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{patient.full_name}</h1>
          <p className="text-slate-500 mt-0.5">Paciente activo</p>
        </div>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Datos personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Email</p>
            <p className="text-sm text-slate-900">{patient.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Teléfono</p>
            <p className="text-sm text-slate-900">{patient.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Fecha de nacimiento</p>
            <p className="text-sm text-slate-900">{patient.birth_date ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Notas clínicas</h2>
        <p className="text-sm text-slate-600">{patient.notes ?? 'Sin notas.'}</p>
      </div>

    </div>
  )
}