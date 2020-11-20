export default function filters({productId}: any) {
  return {
    productId: ({_productId}: any) => {
      return _productId === productId
    },
    active: (x: any) => !x.isFrozen,
    haveToBuy: (x: any) => !x.isDone && !x.isFrozen,
    bought: (x: any) => x.isDone,
    frozen: (x: any) => x.isFrozen,
  }
}
