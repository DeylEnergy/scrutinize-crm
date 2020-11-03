import React from 'react'

export default function useOneTime(cond: boolean, fn: () => void, deps: any[]) {
  const wasCalled = React.useRef<boolean>(false)
  React.useEffect(() => {
    if (cond && !wasCalled.current) {
      fn()
      wasCalled.current = true
    }
  }, deps)
}
