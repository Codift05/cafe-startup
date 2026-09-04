// ============================================================
// Settings Types
// ============================================================

export interface BranchSettings {
  name: string
  ordering_paused: boolean
  dine_in_enabled: boolean
  pickup_enabled: boolean
  default_prep_time_minutes: number
}

export interface OperatingHour {
  day: number
  label: string
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface BranchConfig {
  timezone: string
  currency: string
  tax_rate: number
  tax_included: boolean
}

export interface SettingsResponse {
  branch: BranchSettings
  operating_hours: OperatingHour[]
  settings: BranchConfig
}

// Day labels (Bahasa Indonesia)
export const DAY_LABELS: string[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]
