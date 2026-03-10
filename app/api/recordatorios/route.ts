import { createClient } from '@/lib/supabase/server'
import { enviarRecordatorioCita } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const ahora = new Date()
  const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)
  const en25h = new Date(ahora.getTime() + 25 * 60 * 60 * 1000)

  const { data: citas } = await supabase
    .from('appointments')
    .select(`*, patients(full_name, email), users(full_name)`)
    .in('status', ['scheduled', 'confirmed'])
    .gte('starts_at', en24h.toISOString())
    .lte('starts_at', en25h.toISOString())

  if (!citas || citas.length === 0) {
    return NextResponse.json({ mensaje: 'No hay citas para recordar', enviados: 0 })
  }

  let enviados = 0

  for (const cita of citas) {
    if (!cita.patients?.email) continue

    const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    })

    await enviarRecordatorioCita({
      pacienteEmail: cita.patients.email,
      pacienteNombre: cita.patients.full_name,
      fecha,
      hora,
      fisioterapeuta: cita.users?.full_name ?? 'Tu fisioterapeuta',
    })

    enviados++
  }

  return NextResponse.json({ mensaje: 'Recordatorios enviados', enviados })
}