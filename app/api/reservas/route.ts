import { createClient } from '@/lib/supabase/server'
import { enviarNuevaSolicitudReserva } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { citaId } = await request.json()
  const supabase = await createClient()

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, patients(full_name, email, phone), clinics(name, email)`)
    .eq('id', citaId)
    .single()

  if (!cita || !cita.clinics?.email) {
    return NextResponse.json({ error: 'Cita o clínica no encontrada' }, { status: 404 })
  }

  const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Europe/Madrid'
  })
  const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })

  await enviarNuevaSolicitudReserva({
    clinicaEmail: cita.clinics.email,
    pacienteNombre: cita.patients?.full_name ?? '—',
    pacienteEmail: cita.patients?.email ?? '—',
    pacienteTelefono: cita.patients?.phone ?? '—',
    fecha,
    hora,
    notas: cita.notes,
  })

  return NextResponse.json({ mensaje: 'Notificación enviada' })
}