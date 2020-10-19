export function asc(rows: any[]) {
  return rows.sort((a: any, b: any) => {
    const nameFirst = a.name || a._product.nameModel[0]
    const modelFirst = a.model || a._product.nameModel[1]

    const nameSecond = b.name || b._product.nameModel[0]
    const modelSecond = b.model || b._product.nameModel[1]

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
