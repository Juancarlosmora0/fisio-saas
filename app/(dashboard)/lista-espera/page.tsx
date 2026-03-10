import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ListaEsperaPage() {
  const supabase = await createClient()

  const { data: lista } = await supabase
    .from('waiting_list')
    .select(`*, patients(full_name, email, phone)`)
    .eq('status', 'waiting')
    .order('created_at')

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lista de espera</h1>
          <p className="text-slate-500 mt-1">{lista?.length ?? 0} pacientes esperando</p>
        </div>
        <Link
          href="/lista-espera/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Añadir paciente
        </Link>
      </div>

      {lista?.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-slate-500 text-sm">No hay pacientes en lista de espera</p>
        </div>
      )}

      <div className="space-y-3">
        {lista?.map((item, index) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.patients?.full_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.patients?.phone ?? item.patients?.email ?? '—'}</p>
                  {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                  <p className="text-xs text-slate-300 mt-1">
                    En espera desde {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/agenda/nueva-cita?paciente=${item.patient_id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors"
                >
                  📅 Asignar cita
                </Link>
                <Link
                  href={`/lista-espera/${item.id}/eliminar`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors"
                >
                  ✕ Eliminar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}