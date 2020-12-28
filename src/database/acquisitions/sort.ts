export function asc(rows: any[]) {
  return rows.sort((a: any, b: any) => {
    const nameModelFirst = a?._product?.nameModel || a?._legacyProductNameModel

    const nameModelSecond = b?._product?.nameModel || b?._legacyProductNameModel

    const nameFirst = a.name || nameModelFirst[0]
    const modelFirst = a.model || nameModelFirst[1]

    const nameSecond = b.name || nameModelSecond[0]
    const modelSecond = b.model || nameModelSecond[1]

    const first = [nameFirst.toLowerCase(), modelFirst.toLowerCase()]
    const second = [nameSecond.toLowerCase(), modelSecond.toLowerCase()]

    if (first < second) {
      return -1
    }

    if (first > second) {
      return 1
    }

    return 0
  })
}
