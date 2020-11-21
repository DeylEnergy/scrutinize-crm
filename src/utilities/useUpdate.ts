import React from 'react'

export default function useUpdate(cb: () => any, deps: any[]) {
  const mounted = React.useRef(false)

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    return cb()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
