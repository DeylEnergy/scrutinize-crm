import {sep} from 'path'

export default function recognizeQRCode(code: string) {
  if (typeof code !== 'string') {
    return []
  }

  const separatedCode = code.split('::')

  let prefix
  let data
  if (separatedCode.length === 2) {
    ;[prefix, data] = separatedCode
  } else {
    data = separatedCode
  }

  return [prefix, data]
}
