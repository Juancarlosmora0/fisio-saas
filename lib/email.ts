import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarRecordatorioCita({
  pacienteEmail,
  pacienteNombre,
  fecha,
  hora,
  fisioterapeuta,
}: {
  pacienteEmail: string
  pacienteNombre: string
  fecha: string
  hora: string
  fisioterapeuta: string
}) {
  await resend.emails.send({
    from: 'FisioFlow <onboarding@resend.dev>',
    to: pacienteEmail,
    subject: `Recordatorio de tu cita - ${fecha}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e40af; margin-bottom: 8px;">Recordatorio de cita</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Hola ${pacienteNombre}, te recordamos tu próxima cita:</p>
        
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0;"><strong>📅 Fecha:</strong> ${fecha}</p>
          <p style="margin: 0 0 8px 0;"><strong>🕐 Hora:</strong> ${hora}</p>
          <p style="margin: 0;"><strong>👨‍⚕️ Fisioterapeuta:</strong> ${fisioterapeuta}</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">Si necesitas cancelar o cambiar tu cita, contacta con la clínica con al menos 24 horas de antelación.</p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">FisioFlow · Sistema de gestión de clínicas</p>
        </div>
      </div>
    `,
  })
}