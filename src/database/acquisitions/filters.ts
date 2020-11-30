export default function filters({productId}: any) {
  return {
    productId: ({_productId, inStockCount}: any) => {
      return _productId === productId && inStockCount > 0
    },
    active: (x: any) => !x.isFrozen,
    haveToBuy: (x: any) => !x.isDone && !x.isFrozen,
    bought: (x: any) => x.isDone,
    frozen: (x: any) => x.isFrozen,
  }
}
