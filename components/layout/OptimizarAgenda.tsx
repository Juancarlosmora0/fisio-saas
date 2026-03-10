'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Hueco {
  citaId: string
  fecha: string
  hora: string
  fisio: string
}

interface PacienteEspera {
  id: string
  patientId: string
  nombre: string
  telefono: string
  notas: string
  confirmationToken: string
}

interface Props {
  optimizado: boolean
  onToggle: (valor: boolean) => void
}

export default function OptimizarAgenda({ optimizado, onToggle }: Props) {
  const [loading, setLoading] = useState(false)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [huecos, setHuecos] = useState<Hueco[]>([])
  const [listaEspera, setListaEspera] = useState<PacienteEspera[]>([])
  const [asignando, setAsignando] = useState<string | null>(null)
  const [asignados, setAsignados] = useState<string[]>([])

  const optimizarAgenda = async () => {
    setLoading(true)
    onToggle(!optimizado)

    const supabase = createClient()
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const { data: citasCanceladas } = await supabase
      .from('appointments')
      .select(`*, users(full_name)`)
      .eq('status', 'cancelled')
      .gte('starts_at', startOfWeek.toISOString())
      .lte('starts_at', endOfWeek.toISOString())
      .order('starts_at')

    const { data: espera } = await supabase
      .from('waiting_list')
      .select(`*, patients(full_name, phone)`)
      .eq('status', 'waiting')
      .order('created_at')

    const huecosDetectados: Hueco[] = (citasCanceladas ?? []).map(c => ({
      citaId: c.id,
      fecha: new Date(c.starts_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      hora: new Date(c.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      fisio: c.users?.full_name ?? 'Sin asignar',
    }))

    const pacientes: PacienteEspera[] = (espera ?? []).map(e => ({
      id: e.id,
      patientId: e.patient_id,
      nombre: e.patients?.full_name ?? '—',
      telefono: e.patients?.phone ?? '—',
      notas: e.notes ?? '',
      confirmationToken: e.confirmation_token,
    }))

    setHuecos(huecosDetectados)
    setListaEspera(pacientes)
    setLoading(false)
    setPanelAbierto(huecosDetectados.length > 0)
  }

  const asignarPaciente = async (hueco: Hueco, paciente: PacienteEspera) => {
    setAsignando(hueco.citaId)
    const supabase = createClient()

    // Actualizar cita con nuevo paciente
    await supabase
      .from('appointments')
      .update({ patient_id: paciente.patientId, status: 'confirmed' })
      .eq('id', hueco.citaId)

    // Eliminar de lista de espera
    await supabase
      .from('waiting_list')
      .update({ status: 'assigned' })
      .eq('id', paciente.id)

    // Enviar email de confirmación de cita al paciente
    await fetch('/api/confirmacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId: hueco.citaId }),
    })

    setAsignados(prev => [...prev, hueco.citaId])
    setAsignando(null)
    setHuecos(prev => prev.filter(h => h.citaId !== hueco.citaId))
    setListaEspera(prev => prev.filter(p => p.id !== paciente.id))
  }

  return (
    <>
      <button
        onClick={optimizarAgenda}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          optimizado
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        } disabled:opacity-50`}
      >
        {loading ? '⚡ Optimizando...' : optimizado ? '✅ Agenda optimizada' : '⚡ Optimizar agenda'}
      </button>

      {panelAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPanelAbierto(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">⚡ Optimizar agenda</h2>
                <p className="text-xs text-slate-500 mt-0.5">{huecos.length} huecos detectados esta semana</p>
              </div>
              <button onClick={() => setPanelAbierto(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {huecos.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-slate-500 text-sm">No hay huecos esta semana</p>
                </div>
              )}

              {huecos.map(hueco => (
                <div key={hueco.citaId} className="bg-slate-50 rounded-xl p-4">
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hueco libre</p>
                    <p className="text-sm font-semibold text-slate-900">{hueco.fecha} · {hueco.hora}</p>
                    <p className="text-xs text-slate-500">{hueco.fisio}</p>
                  </div>

                  {listaEspera.length === 0 ? (
                    <p className="text-xs text-slate-400">No hay pacientes en lista de espera</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Sugerencias</p>
                      {listaEspera.slice(0, 3).map(paciente => (
                        <div key={paciente.id} className="bg-white rounded-lg p-3 flex items-center justify-between border border-slate-200">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{paciente.nombre}</p>
                            <p className="text-xs text-slate-400">{paciente.telefono}</p>
                            {paciente.notas && <p className="text-xs text-slate-400 italic">{paciente.notas}</p>}
                          </div>
                          <button
                            onClick={() => asignarPaciente(hueco, paciente)}
                            disabled={asignando === hueco.citaId}
                            className="text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors disabled:opacity-50 ml-3"
                          >
                            {asignando === hueco.citaId ? '⏳ Asignando...' : '📅 Asignar y notificar'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}