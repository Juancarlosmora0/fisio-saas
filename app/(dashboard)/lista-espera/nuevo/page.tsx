import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NuevoListaEsperaPage() {
  const supabase = await createClient()

  const { data: pacientes } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name')

  async function añadirAListaEspera(formData: FormData) {
    'use server'
    const supabase = await createClient()

    await supabase.from('waiting_list').insert({
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
      patient_id: formData.get('patient_id'),
      notes: formData.get('notes'),
      status: 'waiting',
    })

    redirect('/lista-espera')
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <a href="/lista-espera" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
          ← Volver a lista de espera
        </a>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Añadir a lista de espera</h1>

      <form action={añadirAListaEspera} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Paciente</label>
          <select
            name="patient_id"
            required
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un paciente</option>
            {pacientes?.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Ej: Prefiere mañanas, urgente, tratamiento de espalda..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Añadir a lista de espera
        </button>
      </form>
    </div>
  )
}