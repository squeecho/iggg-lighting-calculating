import { useCallback, useRef, useState } from 'react'

/** long-press 지연(ms) 기본값 */
const DEFAULT_DELAY = 300

/** onLongPress(길게 누르기), onClick(짧게 탭) 두 가지 콜백을 지원 */
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  delay: number = DEFAULT_DELAY
) {
  /** setTimeout 핸들 저장 (ReturnType 으로 NodeJS 타입 의존 제거) */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pressed, setPressed] = useState(false)

  /** 눌렀을 때 → 타이머 시작 */
  const start = useCallback(
    (e: React.MouseEvent<Element> | React.TouchEvent<Element>) => {
      e.preventDefault()
      timer.current = setTimeout(() => {
        setPressed(true)
        onLongPress()
      }, delay)
    },
    [delay, onLongPress]
  )

  /** 떼었을 때 → 타이머 해제 & 상황별 콜백 */
  const clear = useCallback(
    (isInside: boolean) => {
      if (timer.current) clearTimeout(timer.current)
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