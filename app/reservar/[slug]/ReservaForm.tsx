'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Horario = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  duracion_slot: number
}

type CitaExistente = {
  starts_at: string
  ends_at: string
}

function generarSlots(horarios: Horario[], citasExistentes: CitaExistente[]) {
  const slots: { fecha: Date; label: string; ocupado: boolean }[] = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let i = 1; i <= 14; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay()

    const horario = horarios.find(h => h.dia_semana === diaSemana)
    if (!horario) continue

    const [hInicio, mInicio] = horario.hora_inicio.split(':').map(Number)
    const [hFin, mFin] = horario.hora_fin.split(':').map(Number)

    const cursor = new Date(fecha)
    cursor.setHours(hInicio, mInicio, 0, 0)
    const fin = new Date(fecha)
    fin.setHours(hFin, mFin, 0, 0)

    while (cursor < fin) {
      const slotInicio = new Date(cursor)
      const slotFin = new Date(cursor)
      slotFin.setMinutes(slotFin.getMinutes() + horario.duracion_slot)

      const ocupado = citasExistentes.some(cita => {
        const citaInicio = new Date(cita.starts_at)
        const citaFin = new Date(cita.ends_at)
        return slotInicio < citaFin && slotFin > citaInicio
      })

      slots.push({
        fecha: slotInicio,
        label: slotInicio.toLocaleTimeString('es-ES', {
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
        }),
        ocupado,
      })

      cursor.setMinutes(cursor.getMinutes() + horario.duracion_slot)
    }
  }

  return slots
}

function agruparPorDia(slots: { fecha: Date; label: string; ocupado: boolean }[]) {
  const grupos: Record<string, typeof slots> = {}
  for (const slot of slots) {
    const key = slot.fecha.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid'
    })
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(slot)
  }
  return grupos
}

export default function ReservaForm({
  clinicaId,
  horarios,
  citasExistentes,
}: {
  clinicaId: string
  clinicaNombre: string
  horarios: Horario[]
  citasExistentes: CitaExistente[]
}) {
  const slots = generarSlots(horarios, citasExistentes)
  const slotsPorDia = agruparPorDia(slots)

  const [paso, setPaso] = useState<'seleccionar' | 'datos' | 'exito'>('seleccionar')
  const [slotSeleccionado, setSlotSeleccionado] = useState<Date | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', notas: '' })
  const [error, setError] = useState('')

  async function confirmarReserva() {
    if (!form.nombre || !form.email || !form.telefono) {
      setError('Por favor rellena todos los campos obligatorios')
      return
    }
    if (!slotSeleccionado) return

    setGuardando(true)
    setError('')
    const supabase = createClient()

    // Buscar o crear paciente
    let pacienteId: string | null = null

    const { data: pacienteExistente } = await supabase
      .from('patients')
      .select('id')
      .eq('email', form.email)
      .eq('clinic_id', clinicaId)
      .single()

    if (pacienteExistente) {
      pacienteId = pacienteExistente.id
    } else {
      const { data: nuevoPaciente } = await supabase
        .from('patients')
        .insert({
          clinic_id: clinicaId,
          full_name: form.nombre,
          email: form.email,
          phone: form.telefono,
        })
        .select('id')
        .single()
      pacienteId = nuevoPaciente?.id ?? null
    }

    if (!pacienteId) {
      setError('Error al registrar el paciente. Inténtalo de nuevo.')
      setGuardando(false)
      return
    }

    const finSlot = new Date(slotSeleccionado)
    finSlot.setMinutes(finSlot.getMinutes() + 45)

    const { data: nuevaCita, error: citaError } = await supabase
      .from('appointments')
      .insert({
        clinic_id: clinicaId,
        patient_id: pacienteId,
        starts_at: slotSeleccionado.toISOString(),
        ends_at: finSlot.toISOString(),
        status: 'pending',
        notes: form.notas || null,
      })
      .select('id')
      .single()

    if (citaError || !nuevaCita) {
      setError('Error al crear la cita. Inténtalo de nuevo.')
      setGuardando(false)
      return
    }

    // Notificar a la clínica
    await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId: nuevaCita.id }),
    })

    setPaso('exito')
    setGuardando(false)
  }

  if (paso === 'exito') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">¡Solicitud enviada!</h2>
        <p className="text-slate-500 text-sm mb-4">
          Hemos recibido tu solicitud para el{' '}
          <strong>
            {slotSeleccionado?.toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long',
              timeZone: 'Europe/Madrid'
            })}
          </strong>{' '}
          a las{' '}
          <strong>
            {slotSeleccionado?.toLocaleTimeString('es-ES', {
              hour: '2-digit', minute: '2-digit',
              timeZone: 'Europe/Madrid'
            })}
          </strong>
        </p>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-700 text-sm">La clínica confirmará tu cita en breve por email.</p>
        </div>
      </div>
    )
  }

  if (paso === 'datos') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <button onClick={() => setPaso('seleccionar')} className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-block">← Volver</button>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Tus datos</h2>
        <div className="bg-blue-50 rounded-xl p-3 mb-6">
          <p className="text-sm text-blue-700">
            📅 {slotSeleccionado?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' })}
            {' · '}
            {slotSeleccionado?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nombre completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre y apellidos"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Teléfono *</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="600 000 000"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Motivo de consulta (opcional)</label>
            <textarea
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              rows={3}
              placeholder="Describe brevemente el motivo de tu consulta..."
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}

        <button
          onClick={confirmarReserva}
          disabled={guardando}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
        >
          {guardando ? 'Enviando...' : '✅ Confirmar solicitud'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Selecciona un horario</h2>
      <p className="text-slate-400 text-sm mb-6">Próximos 14 días disponibles</p>

      <div className="space-y-6">
        {Object.entries(slotsPorDia).map(([dia, slotsDelDia]) => (
          <div key={dia}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">{dia}</p>
            <div className="grid grid-cols-4 gap-2">
              {slotsDelDia.map((slot, i) => (
                <button
                  key={i}
                  disabled={slot.ocupado}
                  onClick={() => {
                    setSlotSeleccionado(slot.fecha)
                    setPaso('datos')
                  }}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    slot.ocupado
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}