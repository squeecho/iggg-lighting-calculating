import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { useLongPress } from './hooks/useLongPress'  

/* ───────── 타입 정의 ───────── */
interface Light {
  id: string
  name: string
  lumen: number
  watt: number
  colorTemp: string
  size: string
  quantity: number
}
interface SpaceType { name: string; lux: number }
interface LightData {
  name: string
  lumenByColorTemp: Record<string, number>
  watt: number
  colorTemps: string[]
  size: string
  category: string
}

/* ───────── 컴포넌트 ───────── */
function App() {
  /* ---------- 상태 ---------- */
  const [area, setArea] = useState<number>(20)
  const [height, setHeight] = useState<number>(2500)

  const [spaceType, setSpaceType] = useState<SpaceType>({ name: '카페', lux: 150 })
  const [desiredLux, setDesiredLux] = useState<number>(spaceType.lux)

  const [selectedLights, setSelectedLights] = useState<Light[]>([])
  const [customLightName, setCustomLightName] = useState('')
  const [customLightLumen, setCustomLightLumen] = useState(0)
  const [customLightWatt, setCustomLightWatt] = useState(0)

  const [totalLumen, setTotalLumen] = useState(0)
  const [totalWatt, setTotalWatt] = useState(0)
  const [expectedLux, setExpectedLux] = useState(0)

  const [selectedCategory, setSelectedCategory] = useState('다운라이트')
  const [selectedLightColorTemps, setSelectedLightColorTemps] = useState<Record<string, string>>({})
  const [tempQuantities, setTempQuantities] = useState<Record<string, number | string>>({})

  const MF = 0.8
  const [UF, setUF] = useState(0.7)

  /* ---------- 상수 ---------- */
  const spaceTypes: SpaceType[] = [
    { name: '술집', lux: 100 },
    { name: '카페', lux: 150 },
    { name: '밥집', lux: 300 },
    { name: '주방', lux: 500 },
    { name: '침실', lux: 100 },
    { name: '거실', lux: 200 },
    { name: '다이닝룸', lux: 300 },
  ]
  const firstRow = ['술집', '카페', '밥집', '주방']
  const secondRow = ['침실', '거실', '다이닝룸']

  const lightCategories = ['다운라이트', '라인조명', '레일조명', '벌브전구', '평판등']

  const lightData: LightData[] = [
    { name: 'COB실린더 3인치', lumenByColorTemp: { '3000K': 510, '4000K': 510, '5000K': 510 }, watt: 6, colorTemps: ['3000K', '4000K', '5000K'], size: '3인치', category: '다운라이트' },
    { name: '오스람LED 2인치(ledvance)', lumenByColorTemp: { '3000K': 560, '4000K': 560, '5700K': 560 }, watt: 8, colorTemps: ['3000K', '4000K', '5700K'], size: '2인치', category: '다운라이트' },
    { name: '오스람LED 3인치', lumenByColorTemp: { '3000K': 540, '4000K': 580, '6500K': 580 }, watt: 8, colorTemps: ['3000K', '4000K', '6500K'], size: '3인치', category: '다운라이트' },
    { name: '오스람LED 6인치(ledvance)', lumenByColorTemp: { '3000K': 1300, '4000K': 1400, '5700K': 1400 }, watt: 20, colorTemps: ['3000K', '4000K', '5700K'], size: '6인치', category: '다운라이트' },
    { name: 'T5', lumenByColorTemp: { '3000K': 472, '4000K': 472, '6500K': 472 }, watt: 5, colorTemps: ['3000K', '4000K', '6500K'], size: '300mm', category: '라인조명' },
    { name: 'T7(T라인, 레일용)', lumenByColorTemp: { '3000K': 400, '4000K': 400, '6500K': 400 }, watt: 5, colorTemps: ['3000K', '4000K', '6500K'], size: '300mm', category: '라인조명' },
    { name: 'T70광폭', lumenByColorTemp: { '3000K': 2700, '4000K': 2700, '6500K': 2700 }, watt: 30, colorTemps: ['3000K', '4000K', '6500K'], size: '600mm', category: '라인조명' },
    { name: 'LED PAR30 (1등급 집중형)', lumenByColorTemp: { '3000K': 1590, '4000K': 1590, '6500K': 1590 }, watt: 15, colorTemps: ['3000K', '4000K', '6500K'], size: 'PAR30', category: '레일조명' },
    { name: 'LED PAR30 (일반집중,확산형)', lumenByColorTemp: { '3000K': 1200, '4000K': 1200, '6500K': 1200 }, watt: 15, colorTemps: ['3000K', '4000K', '6500K'], size: 'PAR30', category: '레일조명' },
    { name: 'COB 20W 원통 레일등', lumenByColorTemp: { '3000K': 1300, '4000K': 1300, '5700K': 1300 }, watt: 20, colorTemps: ['3000K', '4000K', '5700K'], size: '원통형', category: '레일조명' },
    { name: '비츠온 LED 에디슨전구 벌브형(E26)', lumenByColorTemp: { '2700K': 680 }, watt: 8, colorTemps: ['2700K'], size: 'E26', category: '벌브전구' },
    { name: '비츠온 LED 벌브전구(E26)', lumenByColorTemp: { '3000K': 910, '4000K': 1000, '6500K': 1000 }, watt: 12, colorTemps: ['3000K', '4000K', '6500K'], size: 'E26', category: '벌브전구' },
    { name: '비츠온 LED T벌브전구(E26)', lumenByColorTemp: { '3000K': 2520, '6500K': 2520 }, watt: 30, colorTemps: ['3000K', '6500K'], size: 'E26', category: '벌브전구' },
    { name: '오스람 평판등(640*640)', lumenByColorTemp: { '4000K': 4500, '5700K': 4500 }, watt: 50, colorTemps: ['4000K', '5700K'], size: '640x640mm', category: '평판등' },
    { name: '오스람 평판등(1285*320)', lumenByColorTemp: { '4000K': 4500, '5700K': 4500 }, watt: 50, colorTemps: ['4000K', '5700K'], size: '1285x320mm', category: '평판등' },
    { name: '장수LED 십자등', lumenByColorTemp: { '6500K': 4200 }, watt: 55, colorTemps: ['6500K'], size: 'L580*D60', category: '평판등' },
    { name: '장수LED 스키등', lumenByColorTemp: { '2700K': 4500, '6500K': 4500 }, watt: 40, colorTemps: ['2700K', '6500K'], size: '800*60', category: '평판등' },
  ]

  /* ---------- UF 계산 ---------- */
  const calcUF = useCallback((mm: number) => {
    const m = mm / 1000
    if (m <= 2.2) return 0.75
    if (m <= 2.6) return 0.7
    if (m <= 3.0) return 0.65
    if (m <= 3.5) return 0.6
    if (m <= 4.0) return 0.55
    return 0.5
  }, [])
  useEffect(() => setUF(calcUF(height)), [height, calcUF])
  useEffect(() => setDesiredLux(spaceType.lux), [spaceType])

  /* ---------- 조도 계산 ---------- */
  const calcLux = useCallback((lights: Light[]) => {
    const lum = lights.reduce((s, l) => s + l.lumen * l.quantity, 0)
    const w = lights.reduce((s, l) => s + l.watt * l.quantity, 0)
    setTotalLumen(lum); setTotalWatt(w)
    setExpectedLux(Math.round((lum * UF * MF) / (area || 1)))
  }, [area, UF])
  useEffect(() => calcLux(selectedLights), [selectedLights, calcLux])

  /* ---------- 조명 추가/삭제 ---------- */
  const addLight = useCallback((light: LightData, ct: string, qty: number) => {
    if (qty <= 0) return
    const lumen = light.lumenByColorTemp[ct] || 0
    const id = `${light.name}-${ct}`
    setSelectedLights(prev => {
      const idx = prev.findIndex(l => l.name === light.name && l.colorTemp === ct)
      if (idx >= 0) { const a = [...prev]; a[idx] = { ...a[idx], quantity: a[idx].quantity + qty }; return a }
      return [...prev, { id, name: light.name, lumen, watt: light.watt, colorTemp: ct, size: light.size, quantity: qty }]
    })
    setSelectedLightColorTemps(p => { const n = { ...p }; delete n[light.name]; return n })
  }, [])

  const addCustomLight = useCallback(() => {
    if (!customLightName || customLightLumen <= 0 || customLightWatt <= 0) return
    setSelectedLights(p => [...p, {
      id: Date.now().toString(), name: customLightName, lumen: customLightLumen, watt: customLightWatt,
      colorTemp: '커스텀', size: '커스텀', quantity: 1
    }])
    setCustomLightName(''); setCustomLightLumen(0); setCustomLightWatt(0)
  }, [customLightName, customLightLumen, customLightWatt])

  const removeLight = useCallback((id: string) => setSelectedLights(p => p.filter(l => l.id !== id)), [])
  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) { removeLight(id); return }
    setSelectedLights(p => p.map(l => l.id === id ? { ...l, quantity: qty } : l))
  }, [removeLight])

  const filteredLights = lightData.filter(l => l.category === selectedCategory)
  const ufText = (u: number) => {
    if (u === 0.75) return '2.2m 이하'
    if (u === 0.7) return '2.3~2.6m'
    if (u === 0.65) return '2.7~3.0m'
    if (u === 0.6) return '3.1~3.5m'
    if (u === 0.55) return '3.6~4.0m'
    return '4.1m 이상'
  }

  const setCT = (name: string, ct: string) => {
    setSelectedLightColorTemps(p => ({ ...p, [name]: ct }))
    setTempQuantities(p => ({ ...p, [name]: 1 }))
  }

  /* ──────────────────────────── 렌더 ──────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 leading-snug px-4 sm:px-6 md:px-8 lg:px-12 py-16">
      <div className="max-w-2xl w-full mx-auto space-y-16">
        {/* 로고 */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="로고" className="w-24 h-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold">간이 조도 계산기</h1>
        </div>

        {/* ▣ 공간 정보 입력 ▣ */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-center mb-6 border-b pb-4">공간 정보 입력</h2>

          {/* 면적 & 높이 */}
          <div className="space-y-4">
            {/* 면적 */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">면적</span>
              <input type="number" min={0} value={area}
                onChange={e => setArea(+e.target.value)}
                className="w-full pl-16 pr-12 py-3 border rounded-lg text-center" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
            </div>

            {/* 높이 */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">높이</span>
              <input type="number" min={0} step={10} value={height}
                onChange={e => setHeight(+e.target.value)}
                className="w-full pl-16 pr-12 py-3 border rounded-lg text-center" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">mm</span>
            </div>

            <p className="text-center text-sm text-gray-500">
              현재 적용 UF: {UF.toFixed(2)} (높이: {ufText(UF)})
            </p>

            {/* 희망 조도 */}
            <select value={desiredLux} onChange={e => setDesiredLux(+e.target.value)}
              className="w-full py-3 border rounded-lg text-center">
              {Array.from({ length: (1000 - 50) / 50 + 1 }, (_, i) => 50 + i * 50).map(v => (
                <option key={v} value={v}>{v} lx</option>
              ))}
            </select>

            {/* 공간 유형 */}
            <div className="space-y-2">
              <p className="text-center font-medium">공간 유형</p>

              {/* 1행 */}
              <div className="grid grid-cols-4 gap-2">
                {firstRow.map(n => {
                  const t = spaceTypes.find(s => s.name === n)!
                  return (
                    <button key={n}
                      onClick={() => { setSpaceType(t); setDesiredLux(t.lux) }}
                      className={`px-1.5 py-1 rounded-lg text-sm transition
                                        ${spaceType.name === n
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'}`}>
                      {n}<br />( {t.lux} )
                    </button>)
                })}
              </div>

              {/* 2행 */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {secondRow.map(n => {
                  const t = spaceTypes.find(s => s.name === n)!
                  return (
                    <button key={n}
                      onClick={() => { setSpaceType(t); setDesiredLux(t.lux) }}
                      className={`px-1.5 py-1 rounded-lg text-sm transition
                                        ${spaceType.name === n
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'}`}>
                      {n}<br />( {t.lux} )
                    </button>)
                })}
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              참고: 거실(150~300), 주방(300~500),<br /> 침실(100~200), 욕실(300~500),<br />
              서재(400~700), 현관/복도(100~200),<br /> 드레스룸(300~500), 다이닝룸(200~300)
            </p>
          </div>
        </section>

        {/* ▣ 조명 선택 ▣ */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold text-center border-b pb-4">조명 선택</h2>

          {/* 카테고리 탭 */}
          <div className="flex flex-wrap gap-4 justify-center">
            {lightCategories.map(cat => (
              <button key={cat}
                onClick={() => { setSelectedCategory(cat); setSelectedLightColorTemps({}) }}
                className={`px-4 py-2 rounded-lg transition
                                  ${selectedCategory === cat
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* 조명 카드 */}
          <div className="space-y-8 px-1">
            {filteredLights.map(light => (

              /* ---------- long-press 훅 : 임시 수량 컨트롤 ---------- */
              (() => {
                const tDec = useLongPress(() => {
                  const cur = tempQuantities[light.name] || 1
                  setTempQuantities({ ...tempQuantities, [light.name]: Math.max(1, +cur - 1) })
                })
                const tInc = useLongPress(() => {
                  const cur = tempQuantities[light.name] || 1
                  setTempQuantities({ ...tempQuantities, [light.name]: +cur + 1 })
                })

                return (
                  <div key={light.name} className="border rounded-xl p-5 space-y-4">
                    <div className="text-center">
                      <p className="font-medium">{light.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{light.watt}W / {light.size}</p>
                    </div>

                    {/* 색온도 선택 */}
                    <div>
                      <p className="mb-2 text-sm text-center font-medium">색온도 선택</p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {light.colorTemps.map(ct => {
                          const sel = selectedLightColorTemps[light.name] === ct
                          return (
                            <button key={ct}
                              onClick={() => setCT(light.name, ct)}
                              className={`min-w-[78px] px-2 py-1 rounded-lg text-sm leading-tight transition
                                              ${sel
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}>
                              <span className="block">{ct}</span>
                              <span className="block text-[0.65rem]">{light.lumenByColorTemp[ct]} lm</span>
                            </button>)
                        })}
                      </div>
                    </div>

                    {/* 수량 & 추가 */}
                    {selectedLightColorTemps[light.name] && (
                      <div className="flex flex-col items-center gap-3 pt-4 border-t">
                        <div className="flex items-center">
                          <button {...tDec} className="w-10 h-10 ring-1 ring-gray-200 rounded-l-lg">−</button>
                          <input value={tempQuantities[light.name] || 1} type="text" inputMode="numeric"
                            onChange={e => {
                              const v = e.target.value.replace(/[^0-9]/g, '')
                              if (v) setTempQuantities({ ...tempQuantities, [light.name]: +v })
                            }}
                            className="w-16 h-10 border-y text-center" />
                          <button {...tInc} className="w-10 h-10 ring-1 ring-gray-200 rounded-r-lg">+</button>
                        </div>
                        <button onClick={() => {
                          addLight(light, selectedLightColorTemps[light.name], Number(tempQuantities[light.name] || 1))
                          setTempQuantities({ ...tempQuantities, [light.name]: 1 })
                        }}
                          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                          추가
                        </button>
                      </div>
                    )}
                  </div>
                )
              })() /* 즉시 실행 함수 끝 */
            ))}
          </div>
        </section>

        {/* ▣ 커스텀 조명 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold text-center border-b pb-4">커스텀 조명</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="이름" value={customLightName}
              onChange={e => setCustomLightName(e.target.value)}
              className="border px-3 py-2 rounded" />
            <input placeholder="루멘" type="number" min={1} value={customLightLumen || ''}
              onChange={e => setCustomLightLumen(+e.target.value)}
              className="border px-3 py-2 rounded" />
            <input placeholder="와트" type="number" min={1} value={customLightWatt || ''}
              onChange={e => setCustomLightWatt(+e.target.value)}
              className="border px-3 py-2 rounded" />
          </div>

          <button onClick={addCustomLight}
            disabled={!customLightName || customLightLumen <= 0 || customLightWatt <= 0}
            className="w-full py-2 rounded-lg bg-purple-600 text-white disabled:bg-gray-400">커스텀 조명 추가</button>
        </section>

        {/* ▣ 조도 결과 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold text-center border-b pb-4">조도 결과</h2>

          <div className={`p-4 rounded-lg text-center border
                           ${expectedLux >= desiredLux ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <p className="text-4xl font-bold">{expectedLux.toLocaleString()} lx</p>
            <p className="mt-2 text-lg font-medium">
              목표 {desiredLux.toLocaleString()} lx
            </p>

            {desiredLux > 0 && (() => {
              const r = Math.min(expectedLux / desiredLux, 1)
              const p = Math.round(r * 100)
              return (
                <>
                  <div className="mt-4 w-full bg-gray-200 h-3 rounded overflow-hidden">
                    <div style={{ width: `${p}%` }}
                      className={`${r >= 1 ? 'bg-green-500' : 'bg-yellow-400'} h-3 rounded`} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">달성률 {p}%</p>
                </>
              )
            })()}
          </div>

          <div className="flex justify-between text-sm">
            <span>총 {totalLumen.toLocaleString()} lm</span>
            <span>총 {totalWatt.toLocaleString()} W</span>
          </div>
        </section>

        {/* ▣ 선택된 조명 목록 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold text-center border-b pb-4">선택된 조명</h2>

          {selectedLights.length === 0
            ? <p className="text-center text-gray-500">없음</p>
            : <>
              <div className="max-h-80 overflow-y-auto">
                {selectedLights.map(l => {

                  /* ---------- long-press 훅 : 선택 후 수량 컨트롤 ---------- */
                  const dec = useLongPress(() =>
                    updateQty(l.id, Math.max(1, l.quantity - 1))
                  )
                  const inc = useLongPress(() =>
                    updateQty(l.id, l.quantity + 1)
                  )

                  return (
                    <div key={l.id}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b py-3">
                      <div>
                        <p className="font-medium truncate">{l.name}</p>
                        <p className="text-xs text-gray-500">
                          {l.colorTemp}&nbsp;|&nbsp;{l.watt}&nbsp;W
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-px w-32">
                        <button {...dec} className="w-9 h-9 border rounded-l">−</button>
                        <input value={l.quantity} inputMode="numeric"
                          onChange={e => {
                            const v = e.target.value.replace(/[^0-9]/g, '')
                            if (v) updateQty(l.id, +v)
                          }}
                          className="w-12 h-9 border-y text-center" />
                        <button {...inc} className="w-9 h-9 border rounded-r">＋</button>
                      </div>

                      <button onClick={() => removeLight(l.id)}
                        className="px-3 py-1 rounded text-red-600 border border-red-200 hover:bg-red-50">
                        삭제
                      </button>
                    </div>
                  )
                })}
              </div>
              <p className="text-right text-sm text-gray-600">
                총 {selectedLights.reduce((s, l) => s + l.quantity, 0)}개
              </p>
            </>}
        </section>

        <p className="text-center text-xs text-gray-500">
          E = Σ lm × UF × MF ÷ 면적 | UF 자동 보정, MF = 0.8
        </p>
      </div>
    </div>
  )
}

export default App