import { useState, useEffect, useCallback } from 'react'
import './App.css'

/* ───────── 타입 정의 ───────── */
interface Light {
  id: string
  name: string
  lumen: number
  watt: number
  colorTemp: string
  size: string
  quantity: number
  category: string
  type?: string
  thumbnail?: string
}

// 커스텀 조명을 저장하기 위한 인터페이스
interface SavedCustomLight {
  id: string
  name: string
  lumen: number
  watt: number
  type: string
  efficiency?: number
}

// 조도 결과 저장을 위한 인터페이스
interface SavedResult {
  id: string
  area: string
  height: string
  desiredLux: number
  expectedLux: number
  totalLumen: number
  totalWatt: number
  lights: Light[]
}

interface SpaceType { name: string; lux: number }
interface LightData {
  name: string
  lumenByColorTemp: Record<string, number>
  watt: number
  colorTemps: string[]
  size: string
  category: string
  type?: string
  thumbnail?: string
}

/* ───────── 컴포넌트 ───────── */
function App() {
  /* ---------- 상태 ---------- */
  const [area,   setArea]   = useState<string>('20')    // 문자열로 관리 → 앞 0 제거
  const [height, setHeight] = useState<string>('2500')

  const [spaceType,setSpaceType]   = useState<SpaceType>({ name:'카페', lux:150 })
  const [desiredLux,setDesiredLux] = useState<number>(spaceType.lux)

  const [selectedLights, setSelectedLights] = useState<Light[]>([])
  const [customLightName ,setCustomLightName ] = useState('')
  const [customLightLumen,setCustomLightLumen] = useState(0)
  const [customLightWatt ,setCustomLightWatt ] = useState(0)
  const [inputMode, setInputMode] = useState<'lumen' | 'watt'>('lumen')
  const [customLightType, setCustomLightType] = useState('매립조명')
  const [customEfficiency, setCustomEfficiency] = useState<number>(80)
  const [efficiencyError, setEfficiencyError] = useState<string>('')

  const [totalLumen,setTotalLumen] = useState(0)
  const [totalWatt ,setTotalWatt ] = useState(0)
  const [expectedLux,setExpectedLux] = useState(0)

  const [selectedCategory,setSelectedCategory] = useState('다운라이트')
  const [selectedLightColorTemps,setSelectedLightColorTemps] = useState<Record<string,string>>({})
  const [tempQuantities,setTempQuantities] = useState<Record<string,number|string>>({})
  
  // T20 마그네틱 타입 선택 상태
  const [selectedT20Type, setSelectedT20Type] = useState<string>('')

  // 저장된 조도 결과 상태
  const [savedResults, setSavedResults] = useState<SavedResult[]>([])
  const [showSavedResults, setShowSavedResults] = useState<boolean>(false)

  const MF = 0.8
  const [UF,setUF] = useState(0.7)

  // 저장된 커스텀 조명
  const [savedCustomLights, setSavedCustomLights] = useState<SavedCustomLight[]>([])
  const [showSavedLights, setShowSavedLights] = useState(false)

  /* ---------- 상수 ---------- */
  const spaceTypes:SpaceType[] = [
    { name:'술집',     lux:150 },
    { name:'카페',     lux:250 },
    { name:'밥집',     lux:300 },
    { name:'주방',     lux:600 },
    { name:'침실',     lux:150 },
    { name:'거실',     lux:250 },
    { name:'다이닝룸', lux:400 },
  ]
  const firstRow  = ['술집','카페','밥집','주방']
  const secondRow = ['침실','거실','다이닝룸']

  const lightCategories = ['다운라이트','라인조명','레일조명','벌브전구','평판등','간접조명','T20 마그네틱']

  const lightData:LightData[] = [
    { name:'COB실린더 3인치', lumenByColorTemp:{'3000K':510,'4000K':510,'5000K':510}, watt:6, colorTemps:['3000K','4000K','5000K'], size:'3인치', category:'다운라이트', thumbnail:'/images/lights/cob_3inch.png' },
    { name:'오스람LED 2인치(ledvance)', lumenByColorTemp:{'3000K':560,'4000K':560,'5700K':560}, watt:8, colorTemps:['3000K','4000K','5700K'], size:'2인치', category:'다운라이트', thumbnail:'/images/lights/osram_2inch.png' },
    { name:'오스람LED 3인치', lumenByColorTemp:{'3000K':540,'4000K':580,'6500K':580}, watt:8, colorTemps:['3000K','4000K','6500K'], size:'3인치', category:'다운라이트', thumbnail:'/images/lights/osram_3inch.png' },
    { name:'오스람LED 6인치(ledvance)', lumenByColorTemp:{'3000K':1300,'4000K':1400,'5700K':1400}, watt:20, colorTemps:['3000K','4000K','5700K'], size:'6인치', category:'다운라이트', thumbnail:'/images/lights/osram_6inch.png' },
    { name:'오스람 T5(ledvance)', lumenByColorTemp:{'3000K':320,'4000K':320,'6500K':320}, watt:5, colorTemps:['3000K','4000K','6500K'], size:'300mm', category:'라인조명', thumbnail:'/images/lights/osram_t5.png' },
    { name:'진성T8(T7, T라인)', lumenByColorTemp:{'3000K':560,'4000K':560,'6500K':560}, watt:5, colorTemps:['3000K','4000K','6500K'], size:'300mm', category:'라인조명', thumbnail:'/images/lights/jinsung_t8.png' },
    { name:'예도LED T33', lumenByColorTemp:{'3000K':525,'4000K':525,'6500K':525}, watt:5, colorTemps:['3000K','4000K','6500K'], size:'300mm', category:'라인조명', thumbnail:'/images/lights/yedo_t33.png' },
    { name:'T70광폭', lumenByColorTemp:{'3000K':2700,'4000K':2700,'6500K':2700}, watt:30, colorTemps:['3000K','4000K','6500K'], size:'600mm', category:'라인조명', thumbnail:'/images/lights/t70.png' },
    { name:'LED PAR30 (1등급 집중형)', lumenByColorTemp:{'3000K':1590,'4000K':1590,'6500K':1590}, watt:15, colorTemps:['3000K','4000K','6500K'], size:'PAR30', category:'레일조명', thumbnail:'/images/lights/led_par30_1.png' },
    { name:'LED PAR30 (일반집중,확산형)', lumenByColorTemp:{'3000K':1200,'4000K':1200,'6500K':1200}, watt:15, colorTemps:['3000K','4000K','6500K'], size:'PAR30', category:'레일조명', thumbnail:'/images/lights/led_par30_2.png' },
    { name:'COB 20W 원통 레일등', lumenByColorTemp:{'3000K':1300,'4000K':1300,'5700K':1300}, watt:20, colorTemps:['3000K','4000K','5700K'], size:'원통형', category:'레일조명', thumbnail:'/images/lights/cob_rail_20w.png' },
    { name:'비츠온 LED 에디슨전구 벌브형(E26)', lumenByColorTemp:{'2700K':680}, watt:8, colorTemps:['2700K'], size:'E26', category:'벌브전구', thumbnail:'/images/lights/bitzeon_edison.png' },
    { name:'비츠온 LED 벌브전구(E26)', lumenByColorTemp:{'3000K':910,'4000K':1000,'6500K':1000}, watt:12, colorTemps:['3000K','4000K','6500K'], size:'E26', category:'벌브전구', thumbnail:'/images/lights/bitzeon_bulb.png' },
    { name:'비츠온 LED T벌브전구(E26)', lumenByColorTemp:{'3000K':2520,'6500K':2520}, watt:30, colorTemps:['3000K','6500K'], size:'E26', category:'벌브전구', thumbnail:'/images/lights/bitzeon_tbulb.png' },
    { name:'오스람 평판등(640*640)', lumenByColorTemp:{'4000K':4500,'5700K':4500}, watt:50, colorTemps:['4000K','5700K'], size:'640x640mm', category:'평판등', thumbnail:'/images/lights/osram_panel_640.png' },
    { name:'오스람 평판등(1285*320)', lumenByColorTemp:{'4000K':4500,'5700K':4500}, watt:50, colorTemps:['4000K','5700K'], size:'1285x320mm', category:'평판등', thumbnail:'/images/lights/osram_panel_1285.png' },
    { name:'장수LED 십자등', lumenByColorTemp:{'6500K':4200}, watt:55, colorTemps:['6500K'], size:'L580*D60', category:'평판등', thumbnail:'/images/lights/jangsu_cross.png' },
    { name:'장수LED 스키등', lumenByColorTemp:{'2700K':4500,'6500K':4500}, watt:40, colorTemps:['2700K','6500K'], size:'800*60', category:'평판등', thumbnail:'/images/lights/jangsu_ski.png' },
    { name:'비츠온 주차장등', lumenByColorTemp:{'6500K':7200}, watt:80, colorTemps:['6500K'], size:'1200mm', category:'평판등', thumbnail:'/images/lights/bitzeon_parking.png' },
    { name:'간접박스 속 오스람 T5', lumenByColorTemp:{'3000K':320,'4000K':320,'6500K':320}, watt:5, colorTemps:['3000K','4000K','6500K'], size:'300mm', category:'간접조명', thumbnail:'/images/lights/indirect_osram_t5.png' },
    { name:'간접박스 속 동성LED 슬림 라인바', lumenByColorTemp:{'3000K':92,'4000K':92,'6500K':92}, watt:1.2, colorTemps:['3000K','4000K','6500K'], size:'100mm', category:'간접조명', thumbnail:'/images/lights/indirect_dongsung.png' },
    // T20 마그네틱 조명 추가
    // 라인 확산형
    { name:'라인 확산형 등기구 12W', lumenByColorTemp:{'3000K':960,'4000K':960}, watt:12, colorTemps:['3000K','4000K'], size:'W300×D22×H25mm', category:'T20 마그네틱', type:'라인 확산형', thumbnail:'/images/lights/line_12w.png' },
    { name:'라인 확산형 등기구 24W', lumenByColorTemp:{'3000K':1920,'4000K':1920}, watt:24, colorTemps:['3000K','4000K'], size:'W600×D22×H25mm', category:'T20 마그네틱', type:'라인 확산형', thumbnail:'/images/lights/line_24w.png' },
    { name:'라인 확산형 등기구 30W', lumenByColorTemp:{'3000K':2400,'4000K':2400}, watt:30, colorTemps:['3000K','4000K'], size:'W900×D22×H25mm', category:'T20 마그네틱', type:'라인 확산형', thumbnail:'/images/lights/line_30w.png' },
    { name:'라인 확산형 등기구 40W', lumenByColorTemp:{'3000K':3200,'4000K':3200}, watt:40, colorTemps:['3000K','4000K'], size:'W1200×D22×H25mm', category:'T20 마그네틱', type:'라인 확산형', thumbnail:'/images/lights/line_40w.png' },
    // 스타 집중형
    { name:'스타 집중형 등기구 6W', lumenByColorTemp:{'3000K':480,'4000K':480}, watt:6, colorTemps:['3000K','4000K'], size:'W110×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_6w.png' },
    { name:'스타 집중형 등기구 12W', lumenByColorTemp:{'3000K':960,'4000K':960}, watt:12, colorTemps:['3000K','4000K'], size:'W220×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_12w.png' },
    { name:'스타 집중형 등기구 18W', lumenByColorTemp:{'3000K':1440,'4000K':1440}, watt:18, colorTemps:['3000K','4000K'], size:'W330×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_18w.png' },
    { name:'스타 집중형 등기구 24W', lumenByColorTemp:{'3000K':1920,'4000K':1920}, watt:24, colorTemps:['3000K','4000K'], size:'W440×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_24w.png' },
    { name:'스타 집중형 등기구 30W', lumenByColorTemp:{'3000K':2400,'4000K':2400}, watt:30, colorTemps:['3000K','4000K'], size:'W550×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_30w.png' },
    { name:'스타 집중형 등기구 36W', lumenByColorTemp:{'3000K':2880,'4000K':2880}, watt:36, colorTemps:['3000K','4000K'], size:'W660×D22×H25mm', category:'T20 마그네틱', type:'스타 집중형', thumbnail:'/images/lights/star_36w.png' },
    // 스타 폴더 집중형
    { name:'스타 폴더 집중형 등기구 6W', lumenByColorTemp:{'3000K':480,'4000K':480}, watt:6, colorTemps:['3000K','4000K'], size:'W112×D22×H136mm', category:'T20 마그네틱', type:'스타 폴더 집중형', thumbnail:'/images/lights/folder_6w.png' },
    { name:'스타 폴더 집중형 등기구 12W', lumenByColorTemp:{'3000K':960,'4000K':960}, watt:12, colorTemps:['3000K','4000K'], size:'W225×D22×H136mm', category:'T20 마그네틱', type:'스타 폴더 집중형', thumbnail:'/images/lights/folder_12w.png' },
    { name:'스타 폴더 집중형 등기구 18W', lumenByColorTemp:{'3000K':1440,'4000K':1440}, watt:18, colorTemps:['3000K','4000K'], size:'W325×D22×H136mm', category:'T20 마그네틱', type:'스타 폴더 집중형', thumbnail:'/images/lights/folder_18w.png' },
    // 스포트 집중형
    { name:'스포트 집중형 등기구 7W', lumenByColorTemp:{'3000K':560,'4000K':560}, watt:7, colorTemps:['3000K','4000K'], size:'W35×H80mm', category:'T20 마그네틱', type:'스포트 집중형', thumbnail:'/images/lights/spot_7w.png' },
    { name:'스포트 집중형 등기구 12W', lumenByColorTemp:{'3000K':960,'4000K':960}, watt:12, colorTemps:['3000K','4000K'], size:'W42×H100mm', category:'T20 마그네틱', type:'스포트 집중형', thumbnail:'/images/lights/spot_12w.png' },
    { name:'스포트 집중형 등기구 20W', lumenByColorTemp:{'3000K':1600,'4000K':1600}, watt:20, colorTemps:['3000K','4000K'], size:'W48×H105mm', category:'T20 마그네틱', type:'스포트 집중형', thumbnail:'/images/lights/spot_20w.png' },
    // ZOOM 스포트 집중형
    { name:'ZOOM 스포트 집중형 등기구 10W', lumenByColorTemp:{'3000K':800,'4000K':800}, watt:10, colorTemps:['3000K','4000K'], size:'W65×H128mm', category:'T20 마그네틱', type:'ZOOM 스포트 집중형', thumbnail:'/images/lights/zoom_10w.png' },
    { name:'ZOOM 스포트 집중형 등기구 20W', lumenByColorTemp:{'3000K':1600,'4000K':1600}, watt:20, colorTemps:['3000K','4000K'], size:'W85×H145mm', category:'T20 마그네틱', type:'ZOOM 스포트 집중형', thumbnail:'/images/lights/zoom_20w.png' },
  ]

  /* ---------- UF 계산 ---------- */
  const calcUF = useCallback((mm:number)=>{
    const m = mm/1000
    if(m<=2.2) return 0.75
    if(m<=2.6) return 0.7
    if(m<=3.0) return 0.65
    if(m<=3.5) return 0.6
    if(m<=4.0) return 0.55
    return 0.5
  },[])
  useEffect(()=>setUF(calcUF(Number(height)||0)),[height,calcUF])
  useEffect(()=>setDesiredLux(spaceType.lux),[spaceType])

  /* ---------- 조도 계산 ---------- */
  const calcLux = useCallback((lights:Light[])=>{
    const areaNum = Number(area)||1
    const lum = lights.reduce((sum, l) => {
      const isIndirect = l.category === '간접조명'
      const adjustedLumen = isIndirect ? l.lumen * 0.7 : l.lumen
      return sum + adjustedLumen * l.quantity
    }, 0)
    const w = lights.reduce((sum, l) => sum + l.watt * l.quantity, 0)
    setTotalLumen(Math.round(lum))
    setTotalWatt(w)
    setExpectedLux(Math.round(lum * UF * MF / areaNum))
  },[area,UF])
  useEffect(()=>calcLux(selectedLights),[selectedLights,calcLux])

  /* ---------- 입력 필드 0 제거 ---------- */
  const onArea   = (v:string)=> setArea  (v.replace(/^0+(?=\d)/,''))
  const onHeight = (v:string)=> setHeight(v.replace(/^0+(?=\d)/,''))

  /* ---------- 조명 추가/삭제 ---------- */
  const addLight = useCallback((light:LightData,ct:string,qty:number)=>{
    if(qty<=0) return
    if(!ct || !light.lumenByColorTemp[ct]) return
    const lumen = light.lumenByColorTemp[ct]||0
    const id    = `${light.name}-${ct}`
    setSelectedLights(prev=>{
      const idx = prev.findIndex(l=>l.name===light.name&&l.colorTemp===ct)
      if(idx>=0){
        const a=[...prev]; a[idx]={...a[idx],quantity:a[idx].quantity+qty}; return a
      }
      return [...prev,{
        id,
        name:light.name,
        lumen,
        watt:light.watt,
        colorTemp:ct,
        size:light.size,
        quantity:qty,
        category:light.category,
        type:light.type,
        thumbnail:light.thumbnail
      }]
    })
    setSelectedLightColorTemps(p=>{const n={...p}; delete n[light.name]; return n})
  },[])

  // 앱 시작 시 저장된 커스텀 조명 로드
  useEffect(() => {
    const savedLights = localStorage.getItem('customLights')
    if (savedLights) {
      try {
        setSavedCustomLights(JSON.parse(savedLights))
      } catch (e) {
        console.error('저장된 조명을 불러오는 중 오류 발생:', e)
      }
    }
  }, [])

  // 앱 시작 시 저장된 조도 결과 로드
  useEffect(() => {
    const savedResultsData = localStorage.getItem('savedResults')
    if (savedResultsData) {
      try {
        setSavedResults(JSON.parse(savedResultsData))
      } catch (e) {
        console.error('저장된 조도 결과를 불러오는 중 오류 발생:', e)
      }
    }
  }, [])

  // 저장된 커스텀 조명 저장 함수
  const saveCustomLight = useCallback(() => {
    if (!customLightName || customLightLumen <= 0 || customLightWatt <= 0) return

    const newLight: SavedCustomLight = {
      id: Date.now().toString(),
      name: customLightName,
      lumen: customLightLumen,
      watt: customLightWatt,
      type: customLightType,
      efficiency: customLightType === '기타' ? customEfficiency : undefined
    }

    const updatedLights = [...savedCustomLights, newLight]
    setSavedCustomLights(updatedLights)
    localStorage.setItem('customLights', JSON.stringify(updatedLights))
  }, [customLightName, customLightLumen, customLightWatt, customLightType, customEfficiency, savedCustomLights])

  // 저장된 커스텀 조명 로드 함수
  const loadCustomLight = useCallback((light: SavedCustomLight) => {
    setCustomLightName(light.name)
    setCustomLightLumen(light.lumen)
    setCustomLightWatt(light.watt)
    setCustomLightType(light.type)
    if (light.efficiency) {
      setCustomEfficiency(light.efficiency)
    }
    
    // 저장된 조명을 즉시 선택된 조명 목록에 추가
    setSelectedLights(prev => [...prev, {
      id: Date.now().toString(),
      name: light.name,
      lumen: light.lumen,
      watt: light.watt,
      colorTemp: '커스텀',
      size: '커스텀',
      quantity: 1,
      category: light.type === '기타' ? '루멘 기준 커스텀' : light.type,
      type: '커스텀'
    }])
    
    setShowSavedLights(false)
  }, [])

  // 저장된 커스텀 조명 삭제 함수
  const deleteSavedLight = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedLights = savedCustomLights.filter(light => light.id !== id)
    setSavedCustomLights(updatedLights)
    localStorage.setItem('customLights', JSON.stringify(updatedLights))
  }, [savedCustomLights])

  // 현재 조도 결과 저장 함수
  const saveCurrentResult = useCallback(() => {
    if (!area || !height || !desiredLux || selectedLights.length === 0) return

    const newResult: SavedResult = {
      id: Date.now().toString(),
      area,
      height,
      desiredLux,
      expectedLux,
      totalLumen,
      totalWatt,
      lights: [...selectedLights]
    }

    const updatedResults = [newResult, ...savedResults]
    setSavedResults(updatedResults)
    localStorage.setItem('savedResults', JSON.stringify(updatedResults))
  }, [area, height, desiredLux, expectedLux, totalLumen, totalWatt, selectedLights, savedResults])

  // 저장된 결과 불러오기 함수
  const loadResult = useCallback((result: SavedResult) => {
    setArea(result.area)
    setHeight(result.height)
    setDesiredLux(result.desiredLux)
    setSelectedLights([...result.lights])
  }, [])

  // 저장된 결과 삭제 함수
  const deleteResult = useCallback((id: string) => {
    const updatedResults = savedResults.filter(result => result.id !== id)
    setSavedResults(updatedResults)
    localStorage.setItem('savedResults', JSON.stringify(updatedResults))
  }, [savedResults])

  const addCustomLight = useCallback((e: React.MouseEvent)=>{
    e.preventDefault()
    if(!customLightName||customLightLumen<=0||customLightWatt<=0) return
    
    // 사용자 정의 효율이 범위를 벗어난 경우 기본값 적용
    const finalLumen = customLightType === '기타' && (customEfficiency < 40 || customEfficiency > 200 || customEfficiency === 0)
      ? customLightWatt * 80  // 기본값 80 lm/W 적용
      : customLightLumen;
    
    setSelectedLights(p=>[...p,{
      id:Date.now().toString(),
      name:customLightName,
      lumen:finalLumen,
      watt:customLightWatt,
      colorTemp:'커스텀',
      size:'커스텀',
      quantity:1,
      category:inputMode === 'watt' ? customLightType : '루멘 기준 커스텀',
      type:'커스텀'
    }])
    setCustomLightName(''); setCustomLightLumen(0); setCustomLightWatt(0)
  },[customLightName, customLightLumen, customLightWatt, inputMode, customLightType, customEfficiency])

  const removeLight = useCallback((id:string)=>setSelectedLights(p=>p.filter(l=>l.id!==id)),[])
  const updateQty   = useCallback((id:string,qty:number)=>{
    if(qty<1){removeLight(id); return}
    setSelectedLights(p=>p.map(l=>l.id===id?{...l,quantity:qty}:l))
  },[removeLight])

  const filteredLights = lightData.filter(l=>l.category===selectedCategory)
  
  // T20 마그네틱 타입 관련 로직
  const t20Types = ['라인 확산형', '스타 집중형', '스타 폴더 집중형', '스포트 집중형', 'ZOOM 스포트 집중형']
  // 선택된 카테고리가 T20 마그네틱이고 타입이 선택된 경우 해당 타입으로 필터링
  const filteredByT20Type = selectedCategory === 'T20 마그네틱' 
    ? (selectedT20Type ? filteredLights.filter(l => l.type === selectedT20Type) : [])
    : filteredLights
    
  // 카테고리 변경 시 T20 타입 초기화
  useEffect(() => {
    setSelectedT20Type('')
    setSelectedLightColorTemps({})
    setTempQuantities({})
  }, [selectedCategory])
  
  // T20 타입 변경 시 선택 초기화
  useEffect(() => {
    if (selectedCategory === 'T20 마그네틱') {
      setSelectedLightColorTemps({})
      setTempQuantities({})
    }
  }, [selectedT20Type])

  const ufText = (u:number)=>{
    if(u===0.75)return'2.2m 이하'
    if(u===0.7 )return'2.3~2.6m'
    if(u===0.65)return'2.7~3.0m'
    if(u===0.6 )return'3.1~3.5m'
    if(u===0.55)return'3.6~4.0m'
    return'4.1m 이상'
  }

  const setCT = (name:string,ct:string, e: React.MouseEvent)=>{
    e.preventDefault()
    if(name && ct) {
      setSelectedLightColorTemps(p=>({...p,[name]:ct}))
      setTempQuantities(p=>({...p,[name]:1}))
    }
  }

  // 조명 종류별 광효율
  const getLumensPerWatt = useCallback((lightType: string, customEff?: number) => {
    if (lightType === '기타') {
      return customEff || 80;
    }
    
    switch(lightType) {
      case '매립조명': return 90;
      case '직부조명': return 90;
      case '간접조명': return 100;
      case '레일조명': return 85;
      case '전구형 조명': return 100;
      default: return 90;
    }
  }, []);

  /* ──────────────────────────── 렌더 ──────────────────────────── */
  return (
    <div onClick={(e) => e.preventDefault()} className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 leading-snug px-4 py-16">
      <div className="w-full max-w-md mx-auto space-y-14">
        {/* 로고 */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="로고" className="w-32 h-auto mb-3 object-contain"/>
          <h1 className="text-2xl font-bold">간이 조도 계산기</h1>
        </div>

        {/* ▣ 공간 정보 입력 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow border space-y-5">
          <h2 className="text-xl font-semibold text-center">공간 정보 입력</h2>
          
          <p className="text-center text-[0.65rem] text-gray-500 -mt-1 mb-1">(바닥면적, 조명높이)</p>

          {/* 면적 & 높이 */}
          {[
            { label:'면적',   val:area,   set:onArea,   unit:'m²' },
            { label:'높이',   val:height, set:onHeight, unit:'mm'}
          ].map(field=>(
            <div key={field.label} className="relative">
              <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">{field.label}</span>

              <input
                type="text" inputMode="numeric"
                value={field.val}
                onChange={e=>field.set(e.target.value)}
                className="w-full pl-14 pr-14 py-2.5 border rounded-lg text-center"/>

              {/* - 버튼 */}
              <div className="absolute left-14 top-0 h-full flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    field.set(String(Math.max(0, Number(field.val||0)-1)));
                  }}
                  className="h-[40px] px-2 flex items-center justify-center border rounded">−</button>
              </div>

              {/* + 버튼 */}
              <div className="absolute right-14 top-0 h-full flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    field.set(String(Math.max(0, Number(field.val||0)+1)));
                  }}
                  className="h-[40px] px-2 flex items-center justify-center border rounded">＋</button>
              </div>

              <span className="absolute right-3 top-0 h-full flex items-center text-gray-500">{field.unit}</span>
            </div>
          ))}

          <p className="text-center text-xs text-gray-500">현재 적용 UF: {UF.toFixed(2)} (높이: {ufText(UF)})</p>

          {/* 희망 조도 */}
          <div className="relative">
            <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">목표 조도</span>
            
            <select 
              value={desiredLux} 
              onChange={e=>{
                const value = +e.target.value;
                setDesiredLux(value);
                // 포커스 해제하여 선택 UI가 즉시 닫히도록 함
                e.target.blur();
              }}
              className="w-full pl-14 pr-14 py-2.5 border rounded-lg text-center"
              style={{textAlignLast: 'center'}}
            >
              {Array.from({length:(1000-50)/50+1},(_,i)=>50+i*50).map(v=>(
                <option key={v} value={v}>{v} lx</option>
              ))}
            </select>
          </div>

          {/* 공간 유형 */}
          <div className="space-y-1">
            <p className="text-center font-medium">공간 유형</p>

            <div className="grid grid-cols-4 gap-2">
              {firstRow.map(n=>{
                const t=spaceTypes.find(s=>s.name===n)!
                return (
                  <button key={n} type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSpaceType(t);
                      setDesiredLux(t.lux);
                    }}
                    className={`px-1.5 py-1 rounded-lg text-xs transition
                              ${spaceType.name===n
                                ?'bg-blue-600 text-white ring-2 ring-blue-300'
                                :'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'}`}>
                    {n}<br/>( {t.lux} )
                  </button>)
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {secondRow.map(n=>{
                const t=spaceTypes.find(s=>s.name===n)!
                return (
                  <button key={n} type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSpaceType(t);
                      setDesiredLux(t.lux);
                    }}
                    className={`px-1.5 py-1 rounded-lg text-xs transition
                              ${spaceType.name===n
                                ?'bg-blue-600 text-white ring-2 ring-blue-300'
                                :'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'}`}>
                    {n}<br/>( {t.lux} )
                  </button>)
              })}
            </div>
          </div>

          <p className="text-center text-[0.65rem] text-gray-500 leading-relaxed">
            참고: 거실(200~300), 주방(500~700), 침실(150~250), 욕실(500~700),<br/>
            서재(300~500), 현관/복도(100~200), 드레스룸(300~500), 다이닝룸(300~500)
          </p>
        </section>

        {/* ▣ 조명 선택 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow border space-y-6">
          <h2 className="text-xl font-semibold text-center">조명 선택</h2>

          <div className="flex flex-wrap gap-3 justify-center">
            {lightCategories.map(cat=>(
              <button key={cat} type="button"
                      onClick={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedCategory(cat);
                        setSelectedLightColorTemps({});
                        return false;
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition
                                ${selectedCategory===cat
                                  ?'bg-blue-600 text-white ring-2 ring-blue-300'
                                  :'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </div>
          
          {/* T20 마그네틱 타입 선택 UI */}
          {selectedCategory === 'T20 마그네틱' && (
            <div className="pt-2">
              <p className="text-center font-medium mb-3">타입 선택</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {t20Types.map(type => (
                  <button 
                    key={type} 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedT20Type(type);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition
                      ${selectedT20Type === type
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {filteredByT20Type.map(light=>(
              <div key={light.name} className="border rounded-xl p-4 space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                    {light.thumbnail ? (
                      <img src={light.thumbnail} alt={light.name} className="w-full h-auto object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <p className="text-center font-medium">{light.name}</p>
                  <p className="text-center text-sm text-gray-500">{light.watt}W / {light.size}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {light.colorTemps.map(ct=>{
                    const sel = selectedLightColorTemps[light.name]===ct
                    return (
                      <button key={ct} type="button"
                        onClick={(e) => setCT(light.name, ct, e)}
                        className={`w-20 px-2 py-1 rounded-lg text-xs leading-snug transition
                                  ${sel
                                    ?'bg-blue-600 text-white ring-2 ring-blue-300'
                                    :'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}>
                        {ct}<br/>{light.lumenByColorTemp[ct]} lm
                      </button>
                    )
                  })}
                </div>

                {selectedLightColorTemps[light.name] && (
                  <div className="flex flex-col items-center gap-2 pt-4 border-t">
                    <div className="flex items-center">
                      <button type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTempQuantities(p=>{
                            const cur = p[light.name];
                            const numValue = typeof cur === 'number' ? cur : (cur ? parseInt(cur, 10) : 1);
                            return {...p,[light.name]:Math.max(1, numValue-1)}
                          });
                        }}
                        className="w-9 h-9 border rounded-l">−</button>

                      <input 
                        value={tempQuantities[light.name]||1}
                        inputMode="numeric"
                        onChange={e=>{
                          const v=e.target.value.replace(/[^0-9]/g,'')
                          if(v) {
                            const numValue = parseInt(v, 10);
                            setTempQuantities({...tempQuantities,[light.name]: numValue});
                          }
                          else setTempQuantities({...tempQuantities,[light.name]:1})
                        }}
                        onFocus={e => {
                          // 필드 선택 시 내용을 모두 선택 상태로 만들어 쉽게 덮어쓸 수 있게 합니다
                          e.target.select();
                        }}
                        className="w-12 h-9 border-y text-center"/>

                      <button type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTempQuantities(p=>{
                            const cur = p[light.name];
                            const numValue = typeof cur === 'number' ? cur : (cur ? parseInt(cur, 10) : 1);
                            return {...p,[light.name]: numValue+1}
                          });
                        }}
                        className="w-9 h-9 border rounded-r">＋</button>
                    </div>

                    <button type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const colorTemp = selectedLightColorTemps[light.name];
                        if(colorTemp) {
                          addLight(light, colorTemp, Number(tempQuantities[light.name]||1));
                          setTempQuantities({...tempQuantities,[light.name]:1});
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                      추가
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ▣ 커스텀 조명 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow border space-y-6">
          <h2 className="text-xl font-semibold text-center">커스텀 조명</h2>
          
          {/* 입력 모드 탭 */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('lumen')}
              className={`px-4 py-2 rounded-lg transition 
                ${inputMode === 'lumen' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'}`}
            >
              루멘 입력
            </button>
            <button
              type="button"
              onClick={() => setInputMode('watt')}
              className={`px-4 py-2 rounded-lg transition 
                ${inputMode === 'watt' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border'}`}
            >
              와트기반 자동계산(추정치)
            </button>
          </div>

          {inputMode === 'lumen' ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">이름</span>
                <input 
                  value={customLightName}
                  onChange={e=>setCustomLightName(e.target.value)}
                  className="w-full pl-14 pr-4 py-2.5 border rounded-lg text-center"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">루멘</span>
                <input 
                  type="number" 
                  min={1} 
                  value={customLightLumen||''}
                  onChange={e=>{
                    const lumen = +e.target.value;
                    setCustomLightLumen(lumen);
                    // 루멘 입력 시 와트 자동 계산 (효율 90lm/W 기준)
                    setCustomLightWatt(lumen > 0 ? Math.round((lumen / 90) * 10) / 10 : 0);
                  }}
                  className="w-full pl-14 pr-4 py-2.5 border rounded-lg text-center"
                />
              </div>
              {customLightLumen > 0 && (
                <div className="text-gray-500 text-sm">
                  <p>자동 계산된 와트: {customLightWatt} W (효율 90lm/W 기준)</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">조명 종류</span>
                <select
                  value={customLightType}
                  onChange={e => {
                    setCustomLightType(e.target.value);
                    // 기타 외의 옵션 선택 시 에러 메시지 초기화
                    if (e.target.value !== '기타') {
                      setEfficiencyError('');
                    }
                    
                    // 이미 와트 값이 있으면 새 광효율로 루멘 재계산
                    if (customLightWatt > 0) {
                      const eff = e.target.value === '기타' ? customEfficiency : getLumensPerWatt(e.target.value);
                      setCustomLightLumen(customLightWatt * eff);
                    }
                  }}
                  className="w-full pl-24 pr-4 py-2.5 border rounded-lg appearance-none text-center"
                >
                  <option value="매립조명">매립조명 (다운라이트, 평판등, 슬림매입등)</option>
                  <option value="직부조명">직부조명 (COB 원통등, 노출형 실린더 등)</option>
                  <option value="간접조명">간접조명 (T5, 몰딩 안쪽 라인바 등)</option>
                  <option value="레일조명">레일조명 (스포트라이트, 집어등, 줌형 등)</option>
                  <option value="전구형 조명">전구형 조명 (E26 벌브, 팬던트, 샹들리에 등)</option>
                  <option value="기타">기타 (특수 조명 등 – 직접 입력)</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              
              {customLightType === '기타' && (
                <div className="relative">
                  <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">광효율</span>
                  <input 
                    type="number"
                    min="40"
                    max="200"
                    placeholder="40~200 사이 값"
                    value={customEfficiency || ''}
                    onChange={e => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      setCustomEfficiency(value);
                      
                      // 유효성 검사
                      if (value < 40 || value > 200) {
                        setEfficiencyError('40~200 사이의 값을 입력하세요.');
                      } else {
                        setEfficiencyError('');
                        
                        // 이미 와트 값이 있으면 새 광효율로 루멘 재계산
                        if (customLightWatt > 0) {
                          setCustomLightLumen(customLightWatt * value);
                        }
                      }
                    }}
                    className={`w-full pl-14 pr-4 py-2.5 border rounded-lg text-center ${efficiencyError ? 'border-red-500' : ''}`}
                  />
                  {efficiencyError && (
                    <p className="text-red-500 text-xs mt-1">{efficiencyError}</p>
                  )}
                </div>
              )}
              
              <div className="relative">
                <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">이름</span>
                <input 
                  value={customLightName}
                  onChange={e => setCustomLightName(e.target.value)}
                  className="w-full pl-14 pr-4 py-2.5 border rounded-lg text-center"
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-0 h-full flex items-center text-gray-500">와트</span>
                <input 
                  type="number" 
                  min={1} 
                  value={customLightWatt||''}
                  onChange={e => {
                    const watt = +e.target.value;
                    setCustomLightWatt(watt);
                    
                    // 와트 기반 루멘 자동 계산
                    const eff = customLightType === '기타' 
                      ? (customEfficiency < 40 || customEfficiency > 200 ? 80 : customEfficiency) 
                      : getLumensPerWatt(customLightType);
                    
                    setCustomLightLumen(watt * eff);
                  }}
                  className="w-full pl-14 pr-4 py-2.5 border rounded-lg text-center"
                />
              </div>
              
              <div className="text-gray-500 text-sm">
                {customLightWatt > 0 && (
                  <p>자동 계산된 루멘: {customLightLumen} lm (기준 광효율: {
                    customLightType === '기타' 
                      ? (customEfficiency < 40 || customEfficiency > 200 || customEfficiency === 0 ? 80 : customEfficiency) 
                      : getLumensPerWatt(customLightType)
                  } lm/W)</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" 
                    onClick={addCustomLight}
                    disabled={!customLightName||customLightLumen<=0||customLightWatt<=0}
                    className="flex-1 py-2 rounded-lg bg-purple-600 text-white disabled:bg-gray-400">
              {inputMode === 'lumen' 
                ? '루멘 기준 조명 추가' 
                : '와트기반 조명 추가'}
            </button>
            
            <button type="button" 
                    onClick={saveCustomLight}
                    disabled={!customLightName||customLightLumen<=0||customLightWatt<=0}
                    className="flex-1 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-400">
              조명 정보 저장
            </button>
          </div>
        </section>

        {/* ▣ 저장된 조명 불러오기 ▣ */}
        {savedCustomLights.length > 0 && (
          <section className="bg-white p-6 rounded-xl shadow border space-y-6">
            <h2 className="text-xl font-semibold text-center">저장된 조명 불러오기</h2>
            
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setShowSavedLights(!showSavedLights)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white transition hover:bg-green-700"
              >
                저장된 조명 {showSavedLights ? '닫기' : '목록 보기'} ({savedCustomLights.length})
              </button>
            </div>
            
            {showSavedLights && (
              <div className="border rounded-lg p-3 max-h-80 overflow-y-auto">
                <p className="text-center text-sm font-medium mb-2">저장된 조명 목록</p>
                <div className="space-y-2">
                  {savedCustomLights.map((light) => (
                    <div 
                      key={light.id}
                      onClick={() => loadCustomLight(light)}
                      className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{light.name}</p>
                        <p className="text-xs text-gray-500">{light.lumen} lm | {light.watt} W | {light.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => deleteSavedLight(light.id, e)}
                          className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ▣ 조도 결과 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow border space-y-6">
          <h2 className="text-xl font-semibold text-center">조도 결과</h2>

          <div className={`p-4 rounded-lg text-center border
                          ${expectedLux>=desiredLux?'bg-green-50':'bg-yellow-50'}`}>
            <p className="text-4xl font-bold">{expectedLux.toLocaleString()} lx</p>
            <p className="mt-2 text-lg font-medium">
              목표 {desiredLux.toLocaleString()} lx
            </p>

            {desiredLux>0 && (()=>{
              const r = expectedLux/desiredLux
              const p = Math.round(r*100)
              return(
                <>
                  <div className="mt-4 w-full bg-gray-200 h-3 rounded overflow-hidden">
                    <div style={{width: r >= 1 ? '100%' : `${p}%`}}
                         className={`${r>=1?'bg-green-500':'bg-yellow-400'} h-3 rounded`}/>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">달성률 {p}%</p>
                </>
            )})()}
          </div>

          <div className="flex justify-between text-sm">
            <span>총 {totalLumen.toLocaleString()} lm</span>
            <span>총 {totalWatt.toLocaleString()} W</span>
          </div>

          {/* 조도 결과 저장 버튼 */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={saveCurrentResult}
              disabled={!area || !height || !desiredLux || selectedLights.length === 0}
              className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-400 transition hover:bg-green-700"
            >
              조도 결과 저장
            </button>
          </div>
        </section>

        {/* ▣ 선택된 조명 목록 ▣ */}
        <section className="bg-white p-6 rounded-xl shadow border space-y-6">
          <h2 className="text-xl font-semibold text-center">선택된 조명</h2>

          {selectedLights.length===0
            ? <p className="text-center text-gray-500">없음</p>
            : <>
                <div className="max-h-80 overflow-y-auto overflow-x-hidden">
                  {selectedLights.map(l=>(
                    <div key={l.id}
                         className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 border-b py-3">
                      <button type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          removeLight(l.id);
                        }}
                        className="px-2 sm:px-3 py-1 rounded text-red-600 border border-red-200 hover:bg-red-50 whitespace-nowrap">
                        삭제
                      </button>

                      <div className="min-w-0 pr-1">
                        <p className="font-medium truncate max-w-[120px] sm:max-w-full">{l.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {l.colorTemp === '커스텀' 
                            ? `${l.lumen} lm | ${l.watt} W`
                            : `${l.colorTemp} | ${l.watt} W`
                          }
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-px w-[90px] sm:w-32">
                        {/* − */}
                        <button type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQty(l.id,Math.max(1,l.quantity-1));
                          }}
                          className="w-7 h-9 sm:w-9 border rounded-l">−</button>

                        <input 
                          value={l.quantity}
                          inputMode="numeric"
                          onChange={e=>{
                            const v=e.target.value.replace(/[^0-9]/g,'')
                            if(v) updateQty(l.id,+v)
                            // 숫자가 없는 경우 기본값 1로 설정
                            else updateQty(l.id,1)
                          }}
                          onFocus={e => {
                            // 필드 선택 시 내용을 모두 선택 상태로 만들어 쉽게 덮어쓸 수 있게 합니다
                            e.target.select();
                          }}
                          className="w-10 h-9 sm:w-12 border-y text-center"/>

                        {/* ＋ */}
                        <button type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQty(l.id,l.quantity+1);
                          }}
                          className="w-7 h-9 sm:w-9 border rounded-r">＋</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm text-gray-600">
                  총 {selectedLights.reduce((s,l)=>s+l.quantity,0)}개
                </p>
              </>}
        </section>

        {/* ▣ 저장된 조도 결과 ▣ */}
        {savedResults.length > 0 && (
          <section className="bg-white p-6 rounded-xl shadow border space-y-4">
            <h2 className="text-xl font-semibold text-center">저장된 조도 결과</h2>
            
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setShowSavedResults(!showSavedResults)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white transition hover:bg-green-700"
              >
                저장된 결과 {showSavedResults ? '닫기' : '목록 보기'} ({savedResults.length})
              </button>
            </div>
            
            {showSavedResults && (
              <div className="space-y-4">
                {savedResults.map(result => (
                  <div key={result.id} className="border rounded-lg p-4 space-y-3">
                    {/* 기본 정보 */}
                    <div className="flex justify-between text-sm">
                      <span>면적: {result.area} m²</span>
                      <span>높이: {result.height} mm</span>
                      <span>목표: {result.desiredLux} lx</span>
                    </div>
                    
                    {/* 결과 정보 */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-center font-medium">
                        예상 조도: <span className="text-lg font-bold">{result.expectedLux} lx</span>
                      </p>
                      <div className="flex justify-center gap-6 text-sm mt-1">
                        <span>총 {result.totalLumen.toLocaleString()} lm</span>
                        <span>총 {result.totalWatt.toLocaleString()} W</span>
                      </div>
                    </div>
                    
                    {/* 조명 목록 요약 */}
                    <div className="max-h-40 overflow-y-auto border-t pt-2">
                      <p className="text-sm font-medium mb-1">선택된 조명</p>
                      {result.lights.map(light => (
                        <div key={light.id} className="text-xs flex justify-between py-1 border-b">
                          <span className="truncate max-w-[60%]">{light.name} ({light.colorTemp})</span>
                          <span>{light.quantity}개</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* 버튼 */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => loadResult(result)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteResult(result.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <p className="text-center text-[0.65rem] text-gray-500">
          E = Σ lm × UF × MF ÷ 면적&nbsp;|&nbsp;UF 자동 보정, MF = 0.8
        </p>
      </div>
    </div>
  )
}

export default App