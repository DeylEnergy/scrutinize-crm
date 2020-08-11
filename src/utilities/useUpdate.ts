import React from 'react'

export default function useUpdate(cb: () => any, deps: any[]) {
  const mounted = React.useRef(false)

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    cb()
  }, deps)
}
