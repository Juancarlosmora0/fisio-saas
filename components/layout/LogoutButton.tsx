'use client'

import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-600 text-sm transition-colors"
    >
      🚪 Cerrar sesión
    </button>
  )
}