'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Registro = {
  id: string
  tipo: string
  motivo_consulta: string | null
  diagnostico: string | null
  tratamiento_aplicado: string | null
  observaciones: string | null
  dolor_inicial: number | null
  dolor_final: number | null
  created_at: string
  users: { full_name: string } | null
}

export default function HistorialClinico({
  pacienteId,
  clinicId,
  registros,
}: {
  pacienteId: string
  clinicId: string
  registros: Registro[]
}) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    tipo: 'evolucion',
    tratamiento_aplicado: '',
    observaciones: '',
    dolor_inicial: '',
    dolor_final: '',
  })

  async function guardarRegistro() {
    setGuardando(true)
    const supabase = createClient()

    await supabase.from('clinical_records').insert({
      clinic_id: clinicId,
      patient_id: pacienteId,
      tipo: form.tipo,
      tratamiento_aplicado: form.tratamiento_aplicado || null,
      observaciones: form.observaciones || null,
      dolor_inicial: form.dolor_inicial ? parseInt(form.dolor_inicial) : null,
      dolor_final: form.dolor_final ? parseInt(form.dolor_final) : null,
    })

    setForm({ tipo: 'evolucion', tratamiento_aplicado: '', observaciones: '', dolor_inicial: '', dolor_final: '' })
    setMostrarForm(false)
    setGuardando(false)
    router.refresh()
  }

  const tipoLabel = (tipo: string) => {
    if (tipo === 'valoracion_inicial') return { label: 'Valoración inicial', color: 'bg-blue-100 text-blue-700' }
    if (tipo === 'alta') return { label: 'Alta', color: 'bg-green-100 text-green-700' }
    return { label: 'Evolución', color: 'bg-slate-100 text-slate-600' }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-slate-900">🩺 Evolución del tratamiento</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nueva nota'}
        </button>
      </div>

      {/* Formulario nueva nota */}
      {mostrarForm && (
        <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo de registro</label>
            <select
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="evolucion">Evolución de sesión</option>
              <option value="valoracion_inicial">Valoración inicial</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tratamiento aplicado</label>
            <textarea
              value={form.tratamiento_aplicado}
              onChange={e => setForm({ ...form, tratamiento_aplicado: e.target.value })}
              rows={3}
              placeholder="Describe el tratamiento aplicado en esta sesión..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              rows={2}
              placeholder="Observaciones adicionales..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Dolor inicial (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.dolor_inicial}
                onChange={e => setForm({ ...form, dolor_inicial: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Dolor final (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.dolor_final}
                onChange={e => setForm({ ...form, dolor_final: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={guardarRegistro}
            disabled={guardando}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {guardando ? 'Guardando...' : '💾 Guardar nota'}
          </button>
        </div>
      )}

      {/* Timeline de registros */}
      {registros.length === 0 && !mostrarForm && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No hay registros clínicos aún</p>
          <p className="text-slate-300 text-xs mt-1">Pulsa "+ Nueva nota" para añadir el primero</p>
        </div>
      )}

      <div className="space-y-4">
        {registros.map(registro => {
          const { label, color } = tipoLabel(registro.tipo)
          return (
            <div key={registro.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(registro.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      timeZone: 'Europe/Madrid'
                    })}
                  </p>
                  {registro.users?.full_name && (
                    <p className="text-xs text-slate-300">{registro.users.full_name}</p>
                  )}
                </div>
              </div>

              {registro.tratamiento_aplicado && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Tratamiento</p>
                  <p className="text-sm text-slate-700">{registro.tratamiento_aplicado}</p>
                </div>
              )}

              {registro.observaciones && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Observaciones</p>
                  <p className="text-sm text-slate-700">{registro.observaciones}</p>
                </div>
              )}

              {(registro.dolor_inicial !== null || registro.dolor_final !== null) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                  {registro.dolor_inicial !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Dolor inicio</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        registro.dolor_inicial >= 7 ? 'bg-red-100 text-red-700' :
                        registro.dolor_inicial >= 4 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>{registro.dolor_inicial}/10</span>
                    </div>
                  )}
                  {registro.dolor_final !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Dolor final</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        registro.dolor_final >= 7 ? 'bg-red-100 text-red-700' :
                        registro.dolor_final >= 4 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>{registro.dolor_final}/10</span>
                    </div>
                  )}
                  {registro.dolor_inicial !== null && registro.dolor_final !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Mejora</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        registro.dolor_inicial - registro.dolor_final > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {registro.dolor_inicial - registro.dolor_final > 0 ? '↓' : '↑'} {Math.abs(registro.dolor_inicial - registro.dolor_final)} puntos
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}