'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  patients: { id: string; full_name: string }[]
  physios: { id: string; full_name: string }[]
}

export default function NuevaCitaForm({ patients, physios }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const date = (form.date as any).value
    const time = (form.time as any).value
    const duration = parseInt((form.duration as any).value)
    const patient_id = (form.patient_id as any).value
    const physio_id = (form.physio_id as any).value
    const notes = (form.notes as any).value

    const starts_at = new Date(`${date}T${time}:00`)
    const ends_at = new Date(starts_at.getTime() + duration * 60000)

    const supabase = createClient()
    const { error } = await supabase.from('appointments').insert({
      patient_id,
      physio_id,
      starts_at: starts_at.toISOString(),
      ends_at: ends_at.toISOString(),
      duration_minutes: duration,
      notes,
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
      status: 'scheduled',
    })

    if (error) {
      setError('Error al guardar la cita.')
      setLoading(false)
    } else {
      router.push('/agenda')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Paciente *
          </label>
          <select
            name="patient_id"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecciona un paciente</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Fisioterapeuta *
          </label>
          <select
            name="physio_id"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecciona un fisioterapeuta</option>
            {physios.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha *
            </label>
            <input
              name="date"
              type="date"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hora *
            </label>
            <input
              name="time"
              type="time"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Duración
          </label>
          <select
  name="duration"
  defaultValue="60"
  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
>
  <option value="30">30 minutos</option>
  <option value="45">45 minutos</option>
  <option value="60">60 minutos</option>
  <option value="90">90 minutos</option>
</select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Observaciones sobre la cita..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/agenda')}
            className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar cita'}
          </button>
        </div>

      </form>
    </div>
  )
}