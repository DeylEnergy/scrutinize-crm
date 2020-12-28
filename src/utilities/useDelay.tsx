import React from 'react'

const DELAY_MS = 700

function noop() {}

interface HandleDelayProps {
  isProgressing: boolean
  cb?: () => void
}

export default function useDelay(
  defaultState = false,
  delayMs = DELAY_MS,
): [
  boolean,
  {
    handleDelay: (param: HandleDelayProps) => void
    resetDelay: () => void
  },
] {
  const [isDelayed, setIsDelayed] = React.useState(defaultState)

  const lastCalledAt = React.useRef(0)

  const deferredId = React.useRef<any>()

  const handleDelay = React.useCallback(
    ({isProgressing, cb = noop}: HandleDelayProps) => {
      if (!isProgressing) {
        const nowMs = Date.now()
        const passedMs = nowMs - lastCalledAt.current

        const extraDelayMs = passedMs >= delayMs ? 0 : delayMs - passedMs

        deferredId.current = setTimeout(() => {
          requestAnimationFrame(cb)
          setIsDelayed(false)
        }, extraDelayMs)
      } else {
        requestAnimationFrame(cb)
        setIsDelayed(true)
        lastCalledAt.current = Date.now()
        clearTimeout(deferredId.current)
      }
    },
    [delayMs],
  )

  const resetDelay = React.useCallback(() => {
    clearTimeout(deferredId.current)
  }, [])

  React.useEffect(() => {
    lastCalledAt.current = Date.now()
    return resetDelay
  }, [resetDelay])

  return [isDelayed, {handleDelay, resetDelay}]
}
