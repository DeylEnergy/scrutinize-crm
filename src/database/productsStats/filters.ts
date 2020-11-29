export default function filters({_productId}: any) {
  return {
    productId: (productStats: any) => {
      const [productId] = productStats.productIdPeriod
      return _productId === productId
    },
  }
}
