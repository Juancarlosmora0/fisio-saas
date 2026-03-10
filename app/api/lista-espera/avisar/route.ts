import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { citaId } = await request.json()
  const supabase = await createClient()

  const { data: cita } = await supabase
    .from('appointments')
    .select(`*, users(full_name)`)
    .eq('id', citaId)
    .single()

  if (!cita) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  }

  const { data: listaEspera } = await supabase
    .from('waiting_list')
    .select(`*, patients(full_name, email)`)
    .eq('status', 'waiting')
    .eq('clinic_id', cita.clinic_id)
    .order('created_at')

  if (!listaEspera || listaEspera.length === 0) {
    return NextResponse.json({ mensaje: 'No hay pacientes en lista de espera', avisados: 0 })
  }

  const fecha = new Date(cita.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const hora = new Date(cita.starts_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let avisados = 0

  for (const item of listaEspera) {
    if (!item.patients?.email) continue

    const enlaceConfirmacion = `${baseUrl}/confirmar-hueco/${item.confirmation_token}`

    await resend.emails.send({
      from: 'FisioFlow <onboarding@resend.dev>',
      to: item.patients.email,
      subject: `🎉 Hueco disponible el ${fecha} a las ${hora}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e40af; margin-bottom: 8px;">¡Hay un hueco disponible!</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Hola ${item.patients.full_name}, ha quedado libre una cita que podría interesarte:</p>
          
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>📅 Fecha:</strong> ${fecha}</p>
            <p style="margin: 0 0 8px 0;"><strong>🕐 Hora:</strong> ${hora}</p>
            <p style="margin: 0;"><strong>👨‍⚕️ Fisioterapeuta:</strong> ${cita.users?.full_name ?? 'Nuestro equipo'}</p>
          </div>

          <a href="${enlaceConfirmacion}" style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 16px;">
            ✅ Confirmar este hueco
          </a>

          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Si no puedes asistir, simplemente ignora este mensaje.
          </p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">FisioFlow · Sistema de gestión de clínicas</p>
          </div>
        </div>
      `,
    })

    avisados++
  }

  return NextResponse.json({ mensaje: 'Pacientes avisados', avisados })
}