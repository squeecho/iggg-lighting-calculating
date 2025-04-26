// src/hooks/useLongPress.ts
import { useCallback, useRef, useEffect } from 'react'

interface Options {
  delay?: number      // ms (기본 300)
  step?:  number      // 몇 ms마다 콜백 반복? 기본 80
}

/** 버튼을 꾹 누르면 반복 호출되는 훅 */
export function useLongPress(cb: () => void, { delay = 300, step = 80 }: Options = {}) {
  const timer = useRef<NodeJS.Timeout>()
  const fire  = useRef<NodeJS.Timeout>()

  const start = useCallback(() => {
    cb()                                 // 첫 클릭-다운 시 1회 실행
    timer.current = setTimeout(() => {
      fire.current = setInterval(cb, step)  // 길게 누르고 있으면 반복
    }, delay)
  }, [cb, delay, step])

  const clear = useCallback(() => {
    timer.current && clearTimeout(timer.current)
    fire.current  && clearInterval(fire.current)
  }, [])

  useEffect(() => clear, [clear])   // 언마운트 시 정리
  return { onMouseDown: start, onTouchStart: start, onMouseUp: clear, onMouseLeave: clear, onTouchEnd: clear }
}