import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, plataforma } = await req.json()
  if (!text || text.length < 20) {
    return NextResponse.json({ error: 'Texto muy corto' }, { status: 400 })
  }
  const prompt = `Analiza esta oferta de empleo mexicana y extrae los campos en JSON exacto. Contexto: investigacion sobre demanda de ingles en el mercado laboral de Los Mochis/Sinaloa. OFERTA: ${text} Responde UNICAMENTE con JSON valido sin markdown: { "puesto": "titulo exacto", "empresa": "nombre o No especifica", "ubicacion": "ciudad/estado o No especifica", "sector": "sector inferido", "nivel_jerarquico": "Operativo|Tecnico|Especialista|Coordinador|Gerencia", "salario_min": null, "salario_max": null, "salario_informado": "Si|No", "ingles_requerido": "Si|No|Deseable", "nivel_ingles": "Basico|Intermedio|Avanzado|Nativo/Bilingue|No especifica|No aplica", "ingles_en_titulo": "Si|No", "otros_idiomas": "idiomas o Ninguno", "requisitos_educativos": "nivel o No especifica", "cluster": "A-Aduanas|B-Logistica|C-Com.Exterior|D-Almacen|E-Gerencia", "notas": "observacion breve", "confianza": "alta|media|baja" }`
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ofertas-tesis.vercel.app',
        'X-Title': 'Extractor Ofertas Tesis'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1024
      })
    })
    const data = await res.json()
    if (!data.choices?.[0]) {
      return NextResponse.json({ error: 'Error: ' + JSON.stringify(data).slice(0,300) }, { status: 500 })
    }
    const rawText = data.choices[0].message.content || ''
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'No JSON: ' + rawText.slice(0,200) }, { status: 500 })
    }
    const extracted = JSON.parse(match[0])
    extracted.plataforma = plataforma || 'OCC Mundial'
    extracted.fecha = new Date().toLocaleDateString('es-MX')
    return NextResponse.json(extracted)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
