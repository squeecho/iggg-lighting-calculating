import { useCallback, useRef, useState } from 'react'

/** long-press 지연(ms) 기본값 */
const DEFAULT_DELAY = 300

/** 연속 동작 간격(ms) 기본값 */
const DEFAULT_INTERVAL = 100

/** 
 * onLongPress(길게 누르기), onClick(짧게 탭) 두 가지 콜백을 지원
 * continuous: true로 설정하면 버튼을 계속 누르고 있을 때 연속해서 콜백이 호출됨
 */
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  delay: number = DEFAULT_DELAY,
  continuous: boolean = false,
  interval: number = DEFAULT_INTERVAL
) {
  /** setTimeout 핸들 저장 (ReturnType 으로 NodeJS 타입 의존 제거) */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [pressed, setPressed] = useState(false)

  /** 눌렀을 때 → 타이머 시작 */
  const start = useCallback(
    (e: React.MouseEvent<Element> | React.TouchEvent<Element>) => {
      e.preventDefault()
      timer.current = setTimeout(() => {
        setPressed(true)
        onLongPress()
        
        // 연속 동작이 활성화된 경우 인터벌 시작
        if (continuous) {
          intervalTimer.current = setInterval(() => {
            onLongPress()
          }, interval)
        }
      }, delay)
    },
    [delay, onLongPress, continuous, interval]
  )

  /** 떼었을 때 → 타이머 해제 & 상황별 콜백 */
  const clear = useCallback(
    (isInside: boolean) => {
      if (timer.current) clearTimeout(timer.current)
      if (intervalTimer.current) clearInterval(intervalTimer.current)
      if (!pressed && isInside && onClick) onClick()
      setPressed(false)
    },
    [pressed, onClick]
  )

  /** 리턴 : 버튼/터치 공용 이벤트 바인딩 객체 */
  return {
    onMouseDown : start,
    onTouchStart: start,
    onMouseUp   : () => clear(true),
    onTouchEnd  : () => clear(true),
    onMouseLeave: () => clear(false),   // 마우스가 영역 밖으로 나가면 click 무시
  }
}