export default function ConfirmarHuecoExitoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">¡Cita confirmada!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Tu cita ha sido confirmada correctamente. Nos vemos pronto.
        </p>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-green-700 text-sm font-medium">
            ✅ Recibirás un recordatorio por email antes de tu cita.
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          FisioFlow · Sistema de gestión de clínicas
        </p>
      </div>
    </div>
  )
}