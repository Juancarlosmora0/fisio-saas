'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  citaId: string
  estadoActual: string
}

export default function AccionesEstadoCita({ citaId, estadoActual }: Props) {
  const [loading, setLoading] = useState(false)

  const cambiarEstado = async (nuevoEstado: string) => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('appointments')
      .update({ status: nuevoEstado })
      .eq('id', citaId)
    setLoading(false)
    window.location.reload()
  }

const botones = [
    { estado: 'scheduled', label: '🔄 Reactivar', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', mostrar: estadoActual === 'cancelled' || estadoActual === 'no_show' },
    { estado: 'confirmed', label: '✅ Confirmar', color: 'bg-green-100 text-green-700 hover:bg-green-200', mostrar: estadoActual === 'scheduled' },
    { estado: 'completed', label: '🏁 Completada', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', mostrar: estadoActual === 'confirmed' || estadoActual === 'scheduled' },
    { estado: 'no_show', label: '👻 No-show', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', mostrar: estadoActual !== 'cancelled' && estadoActual !== 'completed' && estadoActual !== 'no_show' },
    { estado: 'cancelled', label: '❌ Cancelar', color: 'bg-red-100 text-red-700 hover:bg-red-200', mostrar: estadoActual !== 'cancelled' && estadoActual !== 'completed' },
  ]

  return (
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
  )
}