import { createClient } from '@/lib/supabase/server'
import { enviarConfirmacionCita } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { citaId } = await request.json()
  const supabase = await createClient()

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, patients(full_name, email), users(full_name)`)
    .eq('id', citaId)
    .single()

  if (!cita || !cita.patients?.email) {
    return NextResponse.json({ error: 'Cita o email no encontrado' }, { status: 404 })
  }

  const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Europe/Madrid'
  })
  const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })

  await enviarConfirmacionCita({
    pacienteEmail: cita.patients.email,
    pacienteNombre: cita.patients.full_name,
    fecha,
    hora,
    fisioterapeuta: cita.users?.full_name ?? 'Nuestro equipo',
  })

  return NextResponse.json({ mensaje: 'Confirmación enviada' })
}