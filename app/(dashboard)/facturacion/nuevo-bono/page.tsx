import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NuevoBonoPage() {
  const supabase = await createClient()

  const { data: pacientes } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', '76391f90-d92a-4768-8e2e-0de8c83ae7a1')
    .order('full_name')

  async function crearBono(formData: FormData) {
    'use server'
    const supabase = await createClient()

    await supabase.from('bonos').insert({
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
      patient_id: formData.get('patient_id') as string,
      nombre: formData.get('nombre') as string,
      sesiones_totales: parseInt(formData.get('sesiones_totales') as string),
      precio_total: parseFloat(formData.get('precio_total') as string),
      status: 'active',
    })

    // Registrar el pago del bono
    await supabase.from('payments').insert({
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
      patient_id: formData.get('patient_id') as string,
      amount: parseFloat(formData.get('precio_total') as string),
      method: 'bono',
      status: 'paid',
      notes: `Compra de bono: ${formData.get('nombre')}`,
    })

    redirect('/facturacion')
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <a href="/facturacion" className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">← Volver</a>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">🎫 Crear bono de sesiones</h1>

      <form action={crearBono} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Paciente *</label>
          <select
            name="patient_id"
            required
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un paciente</option>
            {pacientes?.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nombre del bono *</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Bono 10 sesiones fisioterapia"
            required
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nº de sesiones *</label>
            <input
              type="number"
              name="sesiones_totales"
              min="1"
              defaultValue="10"
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Precio total (€) *</label>
            <input
              type="number"
              name="precio_total"
              min="0"
              step="0.01"
              defaultValue="350"
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-700">💡 Al crear el bono se registrará automáticamente el pago en el historial de facturación.</p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors"
        >
          🎫 Crear bono
        </button>
      </form>
    </div>
  )
}