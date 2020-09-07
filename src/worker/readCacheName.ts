export default function readCacheName(cache: any, name: string) {
  return cache[name] ?? (cache[name] = {})
}
