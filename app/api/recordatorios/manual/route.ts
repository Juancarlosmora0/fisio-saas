import { createClient } from '@/lib/supabase/server'
import { enviarRecordatorioCita } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { citaId } = await request.json()
  const supabase = await createClient()

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, patients(full_name, email), users(full_name)`)
    .eq('id', citaId)
    .single()

  if (!cita) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  }

  if (!cita.patients?.email) {
    return NextResponse.json({ error: 'El paciente no tiene email' }, { status: 400 })
  }

  const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Europe/Madrid'
  })
  const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })

  await enviarRecordatorioCita({
    pacienteEmail: cita.patients.email,
    pacienteNombre: cita.patients.full_name,
    fecha,
    hora,
    fisioterapeuta: cita.users?.full_name ?? 'Tu fisioterapeuta',
  })

  return NextResponse.json({ mensaje: 'Recordatorio enviado correctamente' })
}