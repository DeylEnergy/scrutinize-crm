import {getRelativeDateTime, getTabDatetime} from './index'

export default function getTabLabel(cartId: string, locale: string) {
  const cartDatetime = getTabDatetime(cartId)

  const label = getRelativeDateTime({datetime: cartDatetime, locale})

  return label
}
