import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReservaForm from './ReservaForm'

export default async function ReservaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: clinica } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!clinica) notFound()

  const { data: horarios } = await supabase
    .from('clinic_schedules')
    .select('*')
    .eq('clinic_id', clinica.id)
    .order('dia_semana')

  const { data: citasExistentes } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('clinic_id', clinica.id)
    .in('status', ['confirmed', 'pending'])
    .gte('starts_at', new Date().toISOString())

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{clinica.name}</h1>
          <p className="text-slate-500 mt-1">Reserva tu cita online</p>
        </div>

        <ReservaForm
          clinicaId={clinica.id}
          clinicaNombre={clinica.name}
          horarios={horarios ?? []}
          citasExistentes={citasExistentes ?? []}
        />

        <p className="text-xs text-slate-400 text-center mt-6">
          Powered by FisioFlow · Sistema de gestión de clínicas
        </p>
      </div>
    </div>
  )
}