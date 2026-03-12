import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NuevoPagoPage() {
  const supabase = await createClient()

  const { data: pacientes } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', '76391f90-d92a-4768-8e2e-0de8c83ae7a1')
    .order('full_name')

  const { data: bonos } = await supabase
    .from('bonos')
    .select(`id, nombre, sesiones_usadas, sesiones_totales, patient_id, patients(full_name)`)
    .eq('clinic_id', '76391f90-d92a-4768-8e2e-0de8c83ae7a1')
    .eq('status', 'active')

  async function crearPago(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const method = formData.get('method') as string
    const bonoId = formData.get('bono_id') as string
    const pacienteId = formData.get('patient_id') as string
    const amount = formData.get('amount') as string

    await supabase.from('payments').insert({
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
      patient_id: pacienteId,
      amount: parseFloat(amount),
      method,
      status: 'paid',
      notes: formData.get('notes') as string || null,
    })

    // Si el pago es con bono, descontar sesión
    if (method === 'bono' && bonoId) {
      const { data: bono } = await supabase
        .from('bonos')
        .select('sesiones_usadas, sesiones_totales')
        .eq('id', bonoId)
        .single()

      if (bono) {
        const nuevasUsadas = bono.sesiones_usadas + 1
        await supabase
          .from('bonos')
          .update({
            sesiones_usadas: nuevasUsadas,
            status: nuevasUsadas >= bono.sesiones_totales ? 'completed' : 'active'
          })
          .eq('id', bonoId)
      }
    }

    redirect('/facturacion')
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <a href="/facturacion" className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">← Volver</a>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">💳 Registrar pago</h1>

      <form action={crearPago} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
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
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Importe (€) *</label>
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            defaultValue="45"
            required
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Método de pago *</label>
          <select
            name="method"
            required
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash">💵 Efectivo</option>
            <option value="card">💳 Tarjeta</option>
            <option value="transfer">🏦 Transferencia</option>
            <option value="bono">🎫 Bono de sesiones</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bono (si aplica)</label>
          <select
            name="bono_id"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin bono</option>
            {bonos?.map(b => (
              <option key={b.id} value={b.id}>
                {(b.patients as any)?.full_name} — {b.nombre} ({b.sesiones_usadas}/{b.sesiones_totales} sesiones)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Observaciones sobre el pago..."
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          💾 Registrar pago
        </button>
      </form>
    </div>
  )
}