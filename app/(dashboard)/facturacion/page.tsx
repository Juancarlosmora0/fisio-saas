import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FacturacionPage() {
  const supabase = await createClient()

  const { data: pagos } = await supabase
    .from('payments')
    .select(`*, patients(full_name), appointments(starts_at)`)
    .eq('clinic_id', '76391f90-d92a-4768-8e2e-0de8c83ae7a1')
    .order('created_at', { ascending: false })

  const { data: bonos } = await supabase
    .from('bonos')
    .select(`*, patients(full_name)`)
    .eq('clinic_id', '76391f90-d92a-4768-8e2e-0de8c83ae7a1')
    .order('created_at', { ascending: false })

  const totalMes = pagos
    ?.filter(p => {
      const fecha = new Date(p.created_at)
      const ahora = new Date()
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    })
    .reduce((acc, p) => acc + Number(p.amount), 0) ?? 0

  const totalPendiente = pagos
    ?.filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + Number(p.amount), 0) ?? 0

  const bonosActivos = bonos?.filter(b => b.status === 'active').length ?? 0

  const metodoPago = (method: string) => {
    if (method === 'cash') return '💵 Efectivo'
    if (method === 'card') return '💳 Tarjeta'
    if (method === 'transfer') return '🏦 Transferencia'
    if (method === 'bono') return '🎫 Bono'
    return method
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Facturación</h1>
          <p className="text-slate-500 mt-1">Gestión de pagos y bonos</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/facturacion/nuevo-bono"
            className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            🎫 Nuevo bono
          </Link>
          <Link
            href="/facturacion/nuevo-pago"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            + Registrar pago
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">💰</span>
            <span className="text-2xl font-bold text-green-700">{totalMes.toFixed(0)}€</span>
          </div>
          <p className="text-sm font-medium text-green-700">Ingresos este mes</p>
          <p className="text-xs text-green-600 opacity-70 mt-0.5">Pagos completados</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">⏳</span>
            <span className="text-2xl font-bold text-orange-700">{totalPendiente.toFixed(0)}€</span>
          </div>
          <p className="text-sm font-medium text-orange-700">Pagos pendientes</p>
          <p className="text-xs text-orange-600 opacity-70 mt-0.5">Por cobrar</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">🎫</span>
            <span className="text-2xl font-bold text-yellow-700">{bonosActivos}</span>
          </div>
          <p className="text-sm font-medium text-yellow-700">Bonos activos</p>
          <p className="text-xs text-yellow-600 opacity-70 mt-0.5">En uso actualmente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pagos recientes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">💳 Pagos recientes</h2>
          {pagos?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay pagos registrados</p>
          )}
          <div className="space-y-3">
            {pagos?.slice(0, 10).map(pago => (
              <div key={pago.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{pago.patients?.full_name}</p>
                  <p className="text-xs text-slate-400">
                    {metodoPago(pago.method)} · {new Date(pago.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', timeZone: 'Europe/Madrid'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{Number(pago.amount).toFixed(0)}€</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    pago.status === 'paid' ? 'bg-green-100 text-green-700' :
                    pago.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {pago.status === 'paid' ? 'Pagado' : pago.status === 'pending' ? 'Pendiente' : 'Devuelto'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">🎫 Bonos de sesiones</h2>
          {bonos?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay bonos registrados</p>
          )}
          <div className="space-y-3">
            {bonos?.map(bono => (
              <div key={bono.id} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900">{bono.patients?.full_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    bono.status === 'active' ? 'bg-green-100 text-green-700' :
                    bono.status === 'completed' ? 'bg-slate-200 text-slate-600' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {bono.status === 'active' ? 'Activo' : bono.status === 'completed' ? 'Completado' : 'Expirado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{bono.nombre}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(bono.sesiones_usadas / bono.sesiones_totales) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    {bono.sesiones_usadas}/{bono.sesiones_totales} sesiones · {Number(bono.precio_total).toFixed(0)}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}