'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  citaId: string
  estadoActual: string
  pacienteEmail?: string
}

export default function AccionesEstadoCita({ citaId, estadoActual, pacienteEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [listaAvisada, setListaAvisada] = useState(false)
  const [avisados, setAvisados] = useState(0)

  const cambiarEstado = async (nuevoEstado: string) => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('appointments')
      .update({ status: nuevoEstado })
      .eq('id', citaId)

    // Si se cancela, avisar automáticamente a lista de espera
    if (nuevoEstado === 'cancelled') {
      const res = await fetch('/api/lista-espera/avisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citaId }),
      })
      const data = await res.json()
      if (data.avisados > 0) {
        setAvisados(data.avisados)
        setListaAvisada(true)
      }
    }

    setLoading(false)
    window.location.reload()
  }

  const enviarRecordatorio = async () => {
    setLoading(true)
    const res = await fetch('/api/recordatorios/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId }),
    })
    setLoading(false)
    if (res.ok) {
      setEmailEnviado(true)
    } else {
      alert('Error al enviar el recordatorio')
    }
  }

  const avisarListaEspera = async () => {
    setLoading(true)
    const res = await fetch('/api/lista-espera/avisar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId }),
    })
    const data = await res.json()
    setLoading(false)
    setAvisados(data.avisados)
    setListaAvisada(true)
  }

  const botones = [
    { estado: 'scheduled', label: '🔄 Reactivar', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', mostrar: estadoActual === 'cancelled' || estadoActual === 'no_show' },
    { estado: 'confirmed', label: '✅ Confirmar', color: 'bg-green-100 text-green-700 hover:bg-green-200', mostrar: estadoActual === 'scheduled' },
    { estado: 'completed', label: '🏁 Completada', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', mostrar: estadoActual === 'confirmed' || estadoActual === 'scheduled' },
    { estado: 'no_show', label: '👻 No-show', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', mostrar: estadoActual !== 'cancelled' && estadoActual !== 'completed' && estadoActual !== 'no_show' },
    { estado: 'cancelled', label: '❌ Cancelar', color: 'bg-red-100 text-red-700 hover:bg-red-200', mostrar: estadoActual !== 'cancelled' && estadoActual !== 'completed' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {botones.filter(b => b.mostrar).map(b => (
          <button
            key={b.estado}
            onClick={() => cambiarEstado(b.estado)}
            disabled={loading}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${b.color} disabled:opacity-50`}
          >
            {loading ? 'Guardando...' : b.label}
          </button>
        ))}
      </div>

      {/* Avisar lista de espera manual */}
      {(estadoActual === 'cancelled' || estadoActual === 'no_show') && (
        <div className="pt-3 border-t border-slate-100">
          {listaAvisada ? (
            <p className="text-xs text-green-600 font-medium">
              ✅ {avisados} paciente{avisados !== 1 ? 's' : ''} de la lista de espera avisado{avisados !== 1 ? 's' : ''} por email
            </p>
          ) : (
            <button
              onClick={avisarListaEspera}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors disabled:opacity-50"
            >
              ⚡ Avisar a lista de espera
            </button>
          )}
        </div>
      )}

      {/* Recordatorio email */}
      {pacienteEmail && estadoActual !== 'cancelled' && estadoActual !== 'completed' && (
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={enviarRecordatorio}
            disabled={loading || emailEnviado}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            {emailEnviado ? '✅ Recordatorio enviado' : '📧 Enviar recordatorio por email'}
          </button>
          <p className="text-xs text-slate-400 mt-1">Se enviará a {pacienteEmail}</p>
        </div>
      )}
    </div>
  )
}