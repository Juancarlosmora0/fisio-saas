import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConfirmarHuecoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('waiting_list')
    .select(`*, patients(full_name, email)`)
    .eq('confirmation_token', token)
    .eq('status', 'waiting')
    .single()

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">❌</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Enlace no válido</h1>
          <p className="text-slate-500 text-sm">Este hueco ya no está disponible o el enlace ha expirado.</p>
        </div>
      </div>
    )
  }

  if (!item.appointment_id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">😔</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Hueco ya ocupado</h1>
          <p className="text-slate-500 text-sm">Lo sentimos, este hueco ya ha sido ocupado por otro paciente.</p>
        </div>
      </div>
    )
  }

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, users(full_name)`)
    .eq('id', item.appointment_id)
    .eq('status', 'cancelled')
    .single()

  if (!cita) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">😔</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Hueco ya ocupado</h1>
          <p className="text-slate-500 text-sm">Lo sentimos, este hueco ya ha sido ocupado por otro paciente.</p>
        </div>
      </div>
    )
  }

  const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  })

  async function confirmarHueco() {
    'use server'
    const supabase = await createClient()

    // Verificar que la cita sigue cancelada (no la ha cogido otro)
    const { data: citaActual } = await supabase
      .from('appointments')
      .select('status')
      .eq('id', cita.id)
      .single()

    if (citaActual?.status !== 'cancelled') {
      redirect('/confirmar-hueco/ocupado')
    }

    // Asignar cita al paciente
    await supabase
      .from('appointments')
      .update({
        patient_id: item.patient_id,
        status: 'confirmed',
      })
      .eq('id', cita.id)

    // Marcar este item como asignado
    await supabase
      .from('waiting_list')
      .update({ status: 'assigned' })
      .eq('id', item.id)

    // Invalidar todos los demás tokens del mismo hueco
    await supabase
      .from('waiting_list')
      .update({ appointment_id: null })
      .eq('appointment_id', cita.id)
      .neq('id', item.id)

    redirect('/confirmar-hueco/exito')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <p className="text-4xl mb-3">🎉</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-1">¡Hay un hueco disponible!</h1>
          <p className="text-slate-500 text-sm">Hola {item.patients?.full_name}, confirma tu cita:</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 mb-6">
          <p className="text-sm mb-2"><strong>📅 Fecha:</strong> {fecha}</p>
          <p className="text-sm mb-2"><strong>🕐 Hora:</strong> {hora}</p>
          <p className="text-sm"><strong>👨‍⚕️ Fisioterapeuta:</strong> {cita.users?.full_name ?? 'Nuestro equipo'}</p>
        </div>

        <form action={confirmarHueco}>
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
          >
            ✅ Confirmar este hueco
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          Si no puedes asistir, simplemente ignora este mensaje.
        </p>
      </div>
    </div>
  )
}