export default function debounce(func: any, wait = 166) {
  let timeout: any
  function debounced(...args: any) {
    const later = () => {
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }

  debounced.clear = () => {
    clearTimeout(timeout)
  }

  return debounced
}
