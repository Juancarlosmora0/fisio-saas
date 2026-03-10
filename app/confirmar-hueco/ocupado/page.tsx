export default function HuecoOcupadoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
        <p className="text-5xl mb-4">😔</p>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Este hueco ya fue ocupado</h1>
        <p className="text-slate-500 text-sm mb-6">
          Lo sentimos, otro paciente confirmó este hueco antes que tú. Sigues en la lista de espera y te avisaremos cuando haya otro disponible.
        </p>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-700 text-sm font-medium">
            📋 Seguimos teniendo tu nombre en lista de espera.
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          FisioFlow · Sistema de gestión de clínicas
        </p>
      </div>
    </div>
  )
}