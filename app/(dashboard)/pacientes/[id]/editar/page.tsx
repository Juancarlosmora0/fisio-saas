import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function EditarValoracionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: paciente } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!paciente) notFound()

  async function guardarValoracion(formData: FormData) {
    'use server'
    const supabase = await createClient()

    await supabase
      .from('patients')
      .update({
        motivo_consulta: formData.get('motivo_consulta') as string,
        diagnostico: formData.get('diagnostico') as string,
        objetivos: formData.get('objetivos') as string,
        antecedentes: formData.get('antecedentes') as string,
      })
      .eq('id', id)

    redirect(`/pacientes/${id}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={`/pacientes/${id}`} className="text-sm text-slate-400 hover:text-slate-600 mb-6 inline-block">
        ← Volver
      </Link>

      <h1 className="text-xl font-semibold text-slate-900 mb-6">📋 Editar valoración inicial</h1>
      <p className="text-slate-500 text-sm mb-8">Paciente: <strong>{paciente.full_name}</strong></p>

      <form action={guardarValoracion} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Motivo de consulta</label>
          <textarea
            name="motivo_consulta"
            defaultValue={paciente.motivo_consulta ?? ''}
            rows={3}
            placeholder="¿Por qué viene el paciente a consulta?"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Diagnóstico</label>
          <textarea
            name="diagnostico"
            defaultValue={paciente.diagnostico ?? ''}
            rows={3}
            placeholder="Diagnóstico clínico del paciente..."
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Objetivos del tratamiento</label>
          <textarea
            name="objetivos"
            defaultValue={paciente.objetivos ?? ''}
            rows={3}
            placeholder="¿Qué se quiere conseguir con el tratamiento?"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Antecedentes</label>
          <textarea
            name="antecedentes"
            defaultValue={paciente.antecedentes ?? ''}
            rows={3}
            placeholder="Antecedentes médicos relevantes, cirugías previas, alergias..."
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            💾 Guardar valoración
          </button>
          <Link
            href={`/pacientes/${id}`}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}