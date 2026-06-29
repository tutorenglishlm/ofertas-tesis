import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, plataforma } = await req.json()

  if (!text || text.length < 20) {
    return NextResponse.json({ error: 'Texto muy corto' }, { status: 400 })
  }

  const prompt = `Analiza esta oferta de empleo mexicana y extrae los campos en JSON exacto. Contexto: investigacion sobre demanda de ingles en el mercado laboral de Los Mochis/Sinaloa. OFERTA: ${text} Responde UNICAMENTE con JSON valido sin markdown ni explicacion: { "puesto": "titulo exacto", "empresa": "nombre o No especifica", "ubicacion": "ciudad/estado o No especifica", "sector": "sector inferido", "nivel_jerarquico": "Operativo|Tecnico|Especialista|Coordinador|Gerencia", "salario_min": null, "salario_max": null, "salario_informado": "Si|No", "ingles_requerido": "Si|No|Deseable", "nivel_ingles": "Basico|Intermedio|Avanzado|Nativo/Bilingue|No especifica|No aplica", "ingles_en_titulo": "Si|No", "otros_idiomas": "idiomas o Ninguno", "requisitos_educativos": "nivel o No especifica", "cluster": "A-Aduanas|B-Logistica|C-Com.Exterior|D-Almacen|E-Gerencia", "notas": "observacion breve", "confianza": "alta|media|baja" }`

  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.1
        })
      }
    )

    const data = await res.json()

    if (!data.result?.response) {
      return NextResponse.json({ error: 'CF error: ' + JSON.stringify(data).slice(0, 300) }, { status: 500 })
    }

    const rawText = typeof data.result.response === 'string' ? data.result.response : JSON.stringify(data.result.response)
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'No JSON: ' + rawText.slice(0, 200) }, { status: 500 })
    }

    const extracted = JSON.parse(match[0])
    extracted.plataforma = plataforma || 'OCC Mundial'
    extracted.fecha = new Date().toLocaleDateString('es-MX')

    return NextResponse.json(extracted)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
