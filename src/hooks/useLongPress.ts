import { useCallback, useEffect, useRef } from 'react'

interface Options {
  /** 길게 눌렀다고 판단하기까지 지연(ms) — 기본 300 */
  delay?: number
  /** 길게 누른 뒤 반복 간격(ms) — 기본 80 */
  step?:  number
}

/**
 *   const long = useLongPress(() => change(+1))
 *   <button {...long}>＋</button>
 *
 *  ● 첫 터치(클릭) 즉시 1 회 실행 → delay 후 step 간격으로 반복  
 *  ● 손을 떼면(터치 End / Mouse Up / Leave) 타이머 해제
 */
export function useLongPress(
  cb: () => void,
  { delay = 300, step = 80 }: Options = {},
) {
  // 브라우저에서는 number 반환
  const startTimer  = useRef<number | null>(null)
  const repeatTimer = useRef<number | null>(null)

  /** 타이머 모두 해제 */
  const clear = useCallback(() => {
    if (startTimer.current  !== null) clearTimeout(startTimer.current)
    if (repeatTimer.current !== null) clearInterval(repeatTimer.current)
  }, [])

  /** 길게 누르기 시작 */
  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()        // 모바일 ‘복사/공유’ 메뉴 방지
      cb()                      // 첫 1 회
      startTimer.current = window.setTimeout(() => {
        repeatTimer.current = window.setInterval(cb, step)
      }, delay)
    },
    [cb, delay, step],
  )

  useEffect(() => clear, [clear])   // 언마운트 시 정리

  return {
    onPointerDown: start,   // 데스크톱·모바일 모두 대응
    onPointerUp:   clear,
    onPointerLeave: clear,
    onContextMenu: e => e.preventDefault(),  // 길게 눌러 컨텍스트 메뉴 차단
  } as const
}