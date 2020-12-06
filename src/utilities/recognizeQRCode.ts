import codePrefixes from '../constants/codePrefixes'
const LEGACY_STICKER_CHARS = ['l', 'k', 't', 'h', 'g', 'f', 'd', 's', 'a', 'n']

function checkSignature(legacyId: number, decodedPrice: string) {
  if (!Number(legacyId)) {
    return false
  }

  const isEveryCharCorrect = decodedPrice
    .split('')
    .every(char => LEGACY_STICKER_CHARS.includes(char))

  return isEveryCharCorrect
}

function getLegacyCode(value: string) {
  const [legacyIdStr, decodedPrice] = value.split(', ')

  const legacyId = Number(legacyIdStr)

  const isCorrectSignature = checkSignature(legacyId, decodedPrice)

  if (isCorrectSignature) {
    return [codePrefixes.legacySticker, legacyId]
  }
}

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
    const legacyCode = getLegacyCode(separatedCode[0])

    if (legacyCode) {
      ;[prefix, data] = legacyCode
    } else {
      data = separatedCode
    }
  }

  return [prefix, data]
}
