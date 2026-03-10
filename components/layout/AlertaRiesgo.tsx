interface Props {
  totalCancelaciones: number
  nivelRiesgo: string
  porcentajeCancelacion: number
}

export default function AlertaRiesgo({ totalCancelaciones, nivelRiesgo, porcentajeCancelacion }: Props) {
  if (nivelRiesgo === 'bajo') return null

  const config = {
    alto: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      texto: 'text-red-800',
      icono: '🔴',
      titulo: 'Alto riesgo de cancelación',
      mensaje: `Este paciente ha cancelado ${totalCancelaciones} citas (${porcentajeCancelacion}% de sus citas). Considera llamarle para confirmar.`,
    },
    medio: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      texto: 'text-orange-800',
      icono: '🟠',
      titulo: 'Riesgo medio de cancelación',
      mensaje: `Este paciente ha cancelado ${totalCancelaciones} citas (${porcentajeCancelacion}% de sus citas). Envíale un recordatorio.`,
    },
  }

  const c = config[nivelRiesgo as 'alto' | 'medio']
  if (!c) return null

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{c.icono}</span>
        <div>
          <p className={`text-sm font-semibold ${c.texto}`}>{c.titulo}</p>
          <p className={`text-xs mt-1 ${c.texto}`}>{c.mensaje}</p>
        </div>
      </div>
    </div>
  )
}