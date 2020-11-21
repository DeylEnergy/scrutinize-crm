export default function filters({_supplierId}: any) {
  return {
    supplierId: (supplierStats: any) => {
      const [supplierId] = supplierStats.supplierIdPeriod
      return _supplierId === supplierId
    },
  }
}
