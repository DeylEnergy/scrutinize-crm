export function cartIds(rows: any[]) {
  const cartIds = rows.map((x: any) => x.__cartId__)
  // @ts-ignore
  return [...new Set(cartIds)]
}
