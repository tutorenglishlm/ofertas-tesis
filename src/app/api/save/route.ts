import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const oferta = await req.json()

  const { data, error } = await supabase
    .from('ofertas')
    .insert({
      fecha: oferta.fecha,
      plataforma: oferta.plataforma,
      cluster: oferta.cluster,
      puesto: oferta.puesto,
      empresa: oferta.empresa,
      ubicacion: oferta.ubicacion,
      sector: oferta.sector,
      nivel_jerarquico: oferta.nivel_jerarquico,
      salario_min: oferta.salario_min || null,
      salario_max: oferta.salario_max || null,
      salario_informado: oferta.salario_informado,
      ingles_requerido: oferta.ingles_requerido,
      nivel_ingles: oferta.nivel_ingles,
      ingles_en_titulo: oferta.ingles_en_titulo,
      otros_idiomas: oferta.otros_idiomas,
      requisitos_educativos: oferta.requisitos_educativos,
      notas: oferta.notas,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
