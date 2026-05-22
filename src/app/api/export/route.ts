import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'No hay registros' }, { status: 404 })

  const headers = [
    'ID','Fecha','Plataforma','Cluster','Puesto','Empresa','Ubicación',
    'Sector','Nivel Jerárquico','Salario Mín','Salario Máx','Salario Informado',
    'Inglés Requerido','Nivel Inglés','Inglés en Título','Otros Idiomas',
    'Requisitos Educativos','Notas'
  ]

  const rows = data.map(r => [
    r.id, r.fecha, r.plataforma, r.cluster, r.puesto, r.empresa, r.ubicacion,
    r.sector, r.nivel_jerarquico, r.salario_min ?? '', r.salario_max ?? '',
    r.salario_informado, r.ingles_requerido, r.nivel_ingles, r.ingles_en_titulo,
    r.otros_idiomas, r.requisitos_educativos, r.notas
  ])

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = [6,12,14,16,28,22,18,20,16,12,12,14,14,18,14,16,22,30].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws, 'Ofertas')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ofertas_empleo_${new Date().toISOString().split('T')[0]}.xlsx"`
    }
  })
}
