'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevoPacientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      full_name: (form.full_name as any).value,
      email: (form.email as any).value,
      phone: (form.phone as any).value,
      birth_date: (form.birth_date as any).value || null,
      notes: (form.notes as any).value,
      clinic_id: '76391f90-d92a-4768-8e2e-0de8c83ae7a1',
    }

    const supabase = createClient()
    const { error } = await supabase.from('patients').insert(data)

    if (error) {
      setError('Error al guardar el paciente.')
      setLoading(false)
    } else {
      router.push('/pacientes')
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo paciente</h1>
        <p className="text-slate-500 mt-1">Rellena los datos del paciente</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo *
            </label>
            <input
              name="full_name"
              type="text"
              required
              placeholder="Ej: María García López"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="paciente@email.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Teléfono
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="612345678"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha de nacimiento
            </label>
            <input
              name="birth_date"
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notas
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Motivo de consulta, observaciones..."
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
              onClick={() => router.push('/pacientes')}
              className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar paciente'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}