export default function filters({productId}: any) {
  debugger
  return {
    productId: ({_productId}: any) => {
      return _productId === productId
    },
  }
}
