export default function filters({_customerId}: any) {
  return {
    customerId: (customerStats: any) => {
      const [customerId] = customerStats.customerIdPeriod
      return _customerId === customerId
    },
  }
}
