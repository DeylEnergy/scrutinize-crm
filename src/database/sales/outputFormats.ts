export function cartIds(rows: any[]) {
  const cartIds = rows.map((x: any) => x.activeCartId)
  // @ts-ignore
  return cartIds
}
