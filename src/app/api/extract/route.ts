import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, plataforma } = await req.json()

  if (!text || text.length < 20) {
    return NextResponse.json({ error: 'Texto muy corto' }, { status: 400 })
  }

  const prompt = `Analiza esta oferta de empleo mexicana y extrae los campos en JSON exacto.
Contexto: investigación sobre demanda de inglés en el mercado laboral de Los Mochis/Sinaloa, sector logística/aduanas/comercio exterior.

OFERTA:
${text}

Responde ÚNICAMENTE con JSON válido, sin explicación, sin markdown, sin backticks:
{
  "puesto": "título exacto del puesto",
  "empresa": "nombre de la empresa o No especifica",
  "ubicacion": "ciudad/estado o No especifica",
  "sector": "sector/industria inferido",
  "nivel_jerarquico": "Operativo|Técnico|Especialista|Coordinador|Gerencia",
  "salario_min": numero_o_null,
  "salario_max": numero_o_null,
  "salario_informado": "Sí|No",
  "ingles_requerido": "Sí|No|Deseable",
  "nivel_ingles": "Básico|Intermedio|Avanzado|Nativo/Bilingüe|No especifica|No aplica",
  "ingles_en_titulo": "Sí|No",
  "otros_idiomas": "idioma(s) o Ninguno",
  "requisitos_educativos": "nivel educativo requerido o No especifica",
  "cluster": "A-Aduanas|B-Logística|C-Com.Exterior|D-Almacén|E-Gerencia",
  "notas": "observación breve o vacio",
  "confianza": "alta|media|baja"
}

Clusters: A=agente aduanal/aduanas, B=logística/freight/transporte, C=comercio exterior/importaciones, D=almacén/operativo/montacargas, E=gerencia/dirección/supervisión.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      }
    )

    const data = await res.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = rawText.replace(/```json|```/g, '').trim()
    const extracted = JSON.parse(clean)
    extracted.plataforma = plataforma || 'OCC Mundial'
    extracted.fecha = new Date().toLocaleDateString('es-MX')

    return NextResponse.json(extracted)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
