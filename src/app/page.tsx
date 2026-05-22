'use client'
import { useState, useEffect } from 'react'

type Oferta = {
  id?: number
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
  confianza?: string
}

const CLUSTER_COLORS: Record<string, string> = {
  'A-Aduanas': '#4f8ef7', 'B-Logística': '#2ecc71',
  'C-Com.Exterior': '#f4c842', 'D-Almacén': '#ff8a65', 'E-Gerencia': '#ce93d8',
}

const FIELDS = [
  { key:'puesto', label:'Puesto', type:'text', section:'Identificación' },
  { key:'empresa', label:'Empresa', type:'text', section:'Identificación' },
  { key:'ubicacion', label:'Ubicación', type:'text', section:'Identificación' },
  { key:'plataforma', label:'Plataforma', type:'select', options:['OCC Mundial','Indeed México'], section:'Identificación' },
  { key:'fecha', label:'Fecha', type:'text', section:'Identificación' },
  { key:'cluster', label:'Cluster', type:'select', options:['A-Aduanas','B-Logística','C-Com.Exterior','D-Almacén','E-Gerencia'], section:'Clasificación' },
  { key:'sector', label:'Sector / Industria', type:'text', section:'Clasificación' },
  { key:'nivel_jerarquico', label:'Nivel Jerárquico', type:'select', options:['Operativo','Técnico','Especialista','Coordinador','Gerencia'], section:'Clasificación' },
  { key:'salario_informado', label:'Salario Informado', type:'select', options:['Sí','No'], section:'Salario' },
  { key:'salario_min', label:'Salario Mín (MXN)', type:'number', section:'Salario' },
  { key:'salario_max', label:'Salario Máx (MXN)', type:'number', section:'Salario' },
  { key:'ingles_requerido', label:'Inglés Requerido', type:'select', options:['Sí','No','Deseable'], section:'Inglés' },
  { key:'nivel_ingles', label:'Nivel de Inglés', type:'select', options:['Básico','Intermedio','Avanzado','Nativo/Bilingüe','No especifica','No aplica'], section:'Inglés' },
  { key:'ingles_en_titulo', label:'Inglés en Título', type:'select', options:['Sí','No'], section:'Inglés' },
  { key:'otros_idiomas', label:'Otros Idiomas', type:'text', section:'Inglés' },
  { key:'requisitos_educativos', label:'Requisitos Educativos', type:'text', section:'Notas' },
  { key:'notas', label:'Notas / Observaciones', type:'text', section:'Notas' },
]

const SECTIONS = ['Identificación','Clasificación','Salario','Inglés — Variables clave','Notas']
const FIELD_SECTION_MAP: Record<string, string> = {
  'Inglés': 'Inglés — Variables clave', 'Notas': 'Notas'
}

export default function Home() {
  const [text, setText] = useState('')
  const [platform, setPlatform] = useState('OCC Mundial')
  const [extracted, setExtracted] = useState<Oferta | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [records, setRecords] = useState<Oferta[]>([])
  const [logOpen, setLogOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)

  useEffect(() => { fetchRecords() }, [])

  const showToast = (msg: string, err = false) => {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 3200)
  }

  const fetchRecords = async () => {
    const res = await fetch('/api/records')
    if (res.ok) setRecords(await res.json())
  }

  const handleExtract = async () => {
    if (!text.trim() || text.length < 30) { showToast('Pega el texto de la oferta primero.', true); return }
    setLoading(true); setExtracted(null)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, plataforma: platform })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setExtracted(data)
    } catch { showToast('Error al extraer. Intenta de nuevo.', true) }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!extracted) return
    setSaving(true)
    try {
      const res = await fetch('/api/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted)
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      showToast(`✓ Registro #${data.id} guardado`)
      setExtracted(null); setText(''); fetchRecords()
    } catch { showToast('Error al guardar.', true) }
    setSaving(false)
  }

  const handleExport = async () => {
    if (records.length === 0) { showToast('No hay registros para exportar.', true); return }
    setExporting(true)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ofertas_empleo_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      showToast(`✓ Excel exportado — ${records.length} registros`)
    } catch { showToast('Error al exportar.', true) }
    setExporting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return
    await fetch('/api/records', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchRecords(); showToast('Registro eliminado.')
  }

  const updateField = (key: string, value: string) => {
    if (!extracted) return
    setExtracted({ ...extracted, [key]: value })
  }

  const confBorder = (conf?: string) => conf === 'alta' ? '3px solid #2ecc71' : conf === 'media' ? '3px solid #f4c842' : '3px solid #e74c3c'

  const s = {
    body: { minHeight:'100vh', background:'#0d0f14', color:'#e8ecf4', fontFamily:"'IBM Plex Sans', sans-serif", fontSize:14 } as React.CSSProperties,
    header: { background:'#161921', borderBottom:'1px solid #252a35', padding:'14px 24px', display:'flex', alignItems:'center', gap:14, position:'sticky', top:0, zIndex:100 } as React.CSSProperties,
    dot: { width:10, height:10, borderRadius:'50%', background:'#4f8ef7', boxShadow:'0 0 10px #4f8ef7', flexShrink:0 } as React.CSSProperties,
    h1: { fontFamily:"'IBM Plex Mono', monospace", fontSize:13, fontWeight:600, letterSpacing:'0.05em' } as React.CSSProperties,
    badge: { background:'#1e3a6e', border:'1px solid #4f8ef7', color:'#4f8ef7', fontFamily:'monospace', fontSize:11, padding:'3px 10px', borderRadius:3 } as React.CSSProperties,
    exportBtn: { background:'#1a3a2a', border:'1px solid #2ecc71', color:'#2ecc71', fontFamily:'monospace', fontSize:11, padding:'4px 14px', borderRadius:3, cursor:'pointer', transition:'all .15s' } as React.CSSProperties,
    main: { display:'grid', gridTemplateColumns:'1fr 1fr', height:'calc(100vh - 53px)' } as React.CSSProperties,
    panelLeft: { borderRight:'1px solid #252a35', display:'flex', flexDirection:'column' } as React.CSSProperties,
    panelHdr: { background:'#161921', borderBottom:'1px solid #252a35', padding:'12px 20px', display:'flex', alignItems:'center', gap:10 } as React.CSSProperties,
    stepNum: { width:20, height:20, borderRadius:'50%', background:'#4f8ef7', color:'#fff', fontFamily:'monospace', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center' } as React.CSSProperties,
    plabel: { fontFamily:"'IBM Plex Mono', monospace", fontSize:11, color:'#6b7490', textTransform:'uppercase', letterSpacing:'0.1em' } as React.CSSProperties,
    textarea: { flex:1, background:'#0d0f14', color:'#e8ecf4', border:'none', padding:20, fontFamily:"'IBM Plex Sans', sans-serif", fontSize:13, lineHeight:1.7, resize:'none', outline:'none' } as React.CSSProperties,
    footer: { background:'#161921', borderTop:'1px solid #252a35', padding:'12px 20px', display:'flex', gap:10, alignItems:'center' } as React.CSSProperties,
    platformBtn: (active: boolean): React.CSSProperties => ({ fontFamily:'monospace', fontSize:11, padding:'6px 14px', borderRadius:3, border:`1px solid ${active?'#4f8ef7':'#3a4255'}`, background:active?'#1e3a6e':'transparent', color:active?'#4f8ef7':'#6b7490', cursor:'pointer' }),
    extractBtn: { marginLeft:'auto', background:'#4f8ef7', color:'#fff', border:'none', padding:'9px 22px', fontFamily:'monospace', fontSize:12, fontWeight:600, borderRadius:3, cursor:'pointer' } as React.CSSProperties,
    panelRight: { display:'flex', flexDirection:'column', overflow:'hidden' } as React.CSSProperties,
    resultsArea: { flex:1, overflowY:'auto', padding:20 } as React.CSSProperties,
    emptyState: { height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'#3a4255' } as React.CSSProperties,
    fieldRow: (conf?: string): React.CSSProperties => ({ display:'grid', gridTemplateColumns:'160px 1fr', border:'1px solid #252a35', borderRadius:4, overflow:'hidden', marginBottom:8, borderLeft:conf?confBorder(conf):'1px solid #252a35' }),
    fieldLabel: { background:'#161921', padding:'10px 14px', fontFamily:'monospace', fontSize:10, color:'#6b7490', textTransform:'uppercase', letterSpacing:'0.08em', display:'flex', alignItems:'center', borderRight:'1px solid #252a35' } as React.CSSProperties,
    fieldInput: { background:'#0d0f14', border:'none', outline:'none', padding:'10px 14px', color:'#e8ecf4', fontFamily:"'IBM Plex Sans', sans-serif", fontSize:13, width:'100%' } as React.CSSProperties,
    sectionDiv: { fontFamily:'monospace', fontSize:10, color:'#3a4255', textTransform:'uppercase', letterSpacing:'0.12em', padding:'14px 0 6px', borderBottom:'1px solid #252a35', marginBottom:8 } as React.CSSProperties,
    saveArea: { background:'#161921', borderTop:'1px solid #252a35', padding:'12px 20px', display:'flex', gap:10, alignItems:'center' } as React.CSSProperties,
    saveBtn: { background:'#2ecc71', color:'#0d1a11', border:'none', padding:'9px 24px', fontFamily:'monospace', fontSize:12, fontWeight:600, borderRadius:3, cursor:'pointer' } as React.CSSProperties,
    clearBtn: { background:'transparent', color:'#6b7490', border:'1px solid #3a4255', padding:'9px 18px', fontFamily:'monospace', fontSize:12, borderRadius:3, cursor:'pointer' } as React.CSSProperties,
    logSection: { borderTop:'1px solid #252a35', background:'#0d0f14' } as React.CSSProperties,
    logToggle: { padding:'11px 20px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', border:'none', background:'none', color:'#6b7490', fontFamily:'monospace', fontSize:11, width:'100%', textAlign:'left' } as React.CSSProperties,
    logItem: { display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #1a1d26', fontSize:12 } as React.CSSProperties,
  }

  const grouped = SECTIONS.reduce((acc, sec) => {
    acc[sec] = FIELDS.filter(f => {
      const mapped = FIELD_SECTION_MAP[f.section] || f.section
      return mapped === sec
    })
    return acc
  }, {} as Record<string, typeof FIELDS>)

  return (
    <div style={s.body}>
      <header style={s.header}>
        <div style={s.dot} />
        <span style={s.h1}>EXTRACTOR DE OFERTAS — TESIS FELIX VÁZQUEZ</span>
        <span style={{ marginLeft:'auto', fontFamily:'monospace', fontSize:11, color:'#6b7490' }}>Los Mochis, Sinaloa · 2026</span>
        <div style={s.badge}>{records.length} registros</div>
        <button
          style={{ ...s.exportBtn, opacity: exporting ? 0.6 : 1 }}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? '⟳ Exportando...' : '↓ EXPORTAR EXCEL'}
        </button>
      </header>

      <div style={s.main}>
        <div style={s.panelLeft}>
          <div style={s.panelHdr}>
            <div style={s.stepNum}>1</div>
            <span style={s.plabel}>Pega el texto de la oferta</span>
          </div>
          <textarea
            style={s.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Copia y pega aquí el texto completo de la oferta de empleo tal como aparece en OCC o Indeed.\n\nIncluye: título, empresa, descripción, requisitos, salario (si aparece)…\n\nLa IA extraerá todos los campos automáticamente.`}
          />
          <div style={s.footer}>
            <div style={{ display:'flex', gap:8 }}>
              {['OCC Mundial','Indeed México'].map(p => (
                <button key={p} style={s.platformBtn(platform===p)} onClick={() => setPlatform(p)}>{p}</button>
              ))}
            </div>
            <button style={{ ...s.extractBtn, opacity:loading?0.6:1 }} onClick={handleExtract} disabled={loading}>
              {loading ? '⟳ Procesando...' : '⟶ EXTRAER'}
            </button>
          </div>
        </div>

        <div style={s.panelRight}>
          <div style={s.panelHdr}>
            <div style={s.stepNum}>2</div>
            <span style={s.plabel}>Verifica y guarda</span>
            {extracted && (
              <span style={{ marginLeft:'auto', fontFamily:'monospace', fontSize:11, color: CLUSTER_COLORS[extracted.cluster]||'#6b7490' }}>
                {extracted.cluster} · {extracted.ingles_requerido==='Sí'?'🟢 CON inglés':extracted.ingles_requerido==='Deseable'?'🟡 Deseable':'⬜ SIN inglés'}
              </span>
            )}
          </div>

          <div style={s.resultsArea}>
            {!extracted && !loading && (
              <div style={s.emptyState}>
                <div style={{ fontSize:40, opacity:.2 }}>⊡</div>
                <p style={{ fontFamily:'monospace', fontSize:12, textAlign:'center', lineHeight:1.8 }}>
                  Pega una oferta a la izquierda<br />y presiona EXTRAER.<br /><br />
                  La IA llenará todos los campos.<br />Todo se guarda en Supabase.
                </p>
              </div>
            )}
            {loading && (
              <div style={{ ...s.emptyState }}>
                <div style={{ width:32, height:32, border:'2px solid #3a4255', borderTopColor:'#4f8ef7', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily:'monospace', fontSize:12, color:'#6b7490' }}>Gemini extrayendo campos...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {extracted && !loading && (
              <div>
                {SECTIONS.map(sec => (
                  <div key={sec}>
                    <div style={s.sectionDiv as React.CSSProperties}>{sec}</div>
                    {(grouped[sec]||[]).map(f => (
                      <div key={f.key} style={s.fieldRow(['puesto','cluster','ingles_requerido','nivel_ingles'].includes(f.key) ? extracted.confianza : undefined)}>
                        <div style={s.fieldLabel}>{f.label}</div>
                        {f.type==='select' ? (
                          <select style={{ ...s.fieldInput, cursor:'pointer', appearance:'none' as any, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7490' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', backgroundColor:'#0d0f14', paddingRight:32 }}
                            value={(extracted as any)[f.key]||''} onChange={e => updateField(f.key, e.target.value)}>
                            {f.options?.map(o => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} style={s.fieldInput} value={(extracted as any)[f.key]||''} onChange={e => updateField(f.key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {extracted && (
            <div style={s.saveArea}>
              <button style={{ ...s.saveBtn, opacity:saving?0.6:1 }} onClick={handleSave} disabled={saving}>
                {saving ? '⟳ Guardando...' : '✓ GUARDAR REGISTRO'}
              </button>
              <button style={s.clearBtn} onClick={() => { setExtracted(null); setText('') }}>✕ Limpiar</button>
            </div>
          )}
        </div>
      </div>

      <div style={s.logSection}>
        <button style={s.logToggle} onClick={() => setLogOpen(!logOpen)}>
          <span>{logOpen?'▼':'▶'}</span>
          <span>REGISTROS GUARDADOS — {records.length}</span>
          <button
            onClick={e => { e.stopPropagation(); handleExport() }}
            style={{ marginLeft:'auto', background:'transparent', border:'1px solid #3a4255', color:'#6b7490', fontFamily:'monospace', fontSize:11, padding:'4px 12px', borderRadius:3, cursor:'pointer' }}
          >
            ↓ EXPORTAR EXCEL
          </button>
        </button>
        {logOpen && (
          <div style={{ maxHeight:220, overflowY:'auto', padding:'0 20px 12px' }}>
            {records.length===0 && <div style={{ color:'#3a4255', fontFamily:'monospace', fontSize:11, padding:'8px 0' }}>Sin registros aún.</div>}
            {records.map(r => (
              <div key={r.id} style={s.logItem}>
                <span style={{ background:'#1e3a6e', color:'#4f8ef7', fontFamily:'monospace', fontSize:10, padding:'2px 8px', borderRadius:2 }}>{(r.cluster||'?')[0]}</span>
                <span style={{ flex:1 }}>{r.puesto||'—'}</span>
                <span style={{ color:'#6b7490', fontSize:11 }}>{r.empresa||'—'}</span>
                <span style={{ fontFamily:'monospace', fontSize:10, color:r.ingles_requerido==='Sí'?'#2ecc71':'#3a4255' }}>
                  {r.ingles_requerido==='Sí'?'● ING':r.ingles_requerido==='Deseable'?'◐ ING':'○'}
                </span>
                <button onClick={() => r.id && handleDelete(r.id)} style={{ background:'none', border:'none', color:'#3a4255', cursor:'pointer', fontSize:14, padding:'2px 6px' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:toast.err?'#e74c3c':'#2ecc71', color:toast.err?'#fff':'#0d1a11', fontFamily:'monospace', fontSize:12, fontWeight:600, padding:'10px 20px', borderRadius:4, zIndex:999, animation:'fadeIn .25s ease' }}>
          {toast.msg}
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
        </div>
      )}
    </div>
  )
}
