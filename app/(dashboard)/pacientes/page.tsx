import { createClient } from '@/lib/supabase/server'

export default async function PacientesPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pacientes</h1>
          <p className="text-slate-500 mt-1">{patients?.length ?? 0} pacientes activos</p>
        </div>
        <a href="/pacientes/nuevo" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Nuevo paciente
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients?.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <a href={`/pacientes/${patient.id}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      {patient.full_name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{patient.full_name}</span>
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{patient.email ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{patient.phone ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{patient.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}