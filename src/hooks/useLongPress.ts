import { useCallback, useEffect, useRef } from 'react'

/** 옵션 */
interface Options {
  /** 길게 눌렀다고 판단하기까지 지연(ms) - 기본 300 */
  delay?: number
  /** 길게 누른 뒤 반복 간격(ms) - 기본 80 */
  step?:  number
}

/**
 * 버튼에 넣으면 -
 * ● `onMouseDown / onTouchStart` → 1회 실행 → delay 후 step 간격으로 반복  
 * ● `onMouseUp / onTouchEnd / onMouseLeave` → 정지
 */
export function useLongPress(cb: () => void, { delay = 300, step = 80 }: Options = {}) {
  // 브라우저 환경에 맞춰 number 타입으로
  const startTimer = useRef<number | null>(null)
  const repeatTimer = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (startTimer.current !== null)  clearTimeout(startTimer.current)
    if (repeatTimer.current !== null) clearInterval(repeatTimer.current)
  }, [])

  const start = useCallback(() => {
    cb()                                                // 첫 클릭 시 1회
    startTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(cb, step)   // 길게 누르면 반복
    }, delay)
  }, [cb, delay, step])

  useEffect(() => clear, [clear])        // 컴포넌트 언마운트 시 정리

  return {
    onMouseDown:  start,
    onTouchStart: start,
    onMouseUp:    clear,
    onTouchEnd:   clear,
    onMouseLeave: clear,
  } as const
}