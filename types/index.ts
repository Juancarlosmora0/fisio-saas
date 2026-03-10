export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'no_show'

export type UserRole = 'admin' | 'receptionist' | 'physio'

export interface Clinic {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  timezone: string
  created_at: string
}

export interface AppUser {
  id: string
  clinic_id: string
  full_name: string
  email: string
  role: UserRole
  color: string
  is_active: boolean
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  email: string | null
  phone: string | null
  birth_date: string | null
  notes: string | null
  medical_history: string | null
  is_active: boolean
  created_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  physio_id: string
  starts_at: string
  ends_at: string
  duration_minutes: number
  status: AppointmentStatus
  notes: string | null
  reminder_sent_at: string | null
  created_at: string
}

export interface ClinicalNote {
  id: string
  clinic_id: string
  patient_id: string
  appointment_id: string | null
  physio_id: string
  content: string
  evolution: string | null
  created_at: string
}