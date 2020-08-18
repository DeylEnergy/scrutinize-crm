const filters = {
  active: (x: any) => !x.isFrozen,
  haveToBuy: (x: any) => !x.isDone && !x.isFrozen,
  bought: (x: any) => x.isDone,
  frozen: (x: any) => x.isFrozen,
}

export default filters
