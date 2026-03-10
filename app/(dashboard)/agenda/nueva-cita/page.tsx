import { createClient } from '@/lib/supabase/server'
import NuevaCitaForm from './NuevaCitaForm'

export default async function NuevaCitaPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  const { data: physios } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('is_active', true)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/agenda" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
          ← Volver a la agenda
        </a>
        <h1 className="text-2xl font-semibold text-slate-900 mt-4">Nueva cita</h1>
        <p className="text-slate-500 mt-1">Programa una nueva cita</p>
      </div>
      <NuevaCitaForm patients={patients ?? []} physios={physios ?? []} />
    </div>
  )
}