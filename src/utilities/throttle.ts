export default function throttle(fn: any, delay: number) {
  let last = 0

  return (...args: any) => {
    const now = Date.now()
    if (now - last < delay) {
      return
    }
    last = now

    return fn(...args)
  }
}
