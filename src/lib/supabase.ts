import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Oferta = {
  id?: number
  created_at?: string
  fecha: string
  plataforma: string
  cluster: string
  puesto: string
  empresa: string
  ubicacion: string
  sector: string
  nivel_jerarquico: string
  salario_min: number | null
  salario_max: number | null
  salario_informado: string
  ingles_requerido: string
  nivel_ingles: string
  ingles_en_titulo: string
  otros_idiomas: string
  requisitos_educativos: string
  notas: string
  synced_to_sheets?: boolean
}
