import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRow} from '../queries'
import {STORE_NAME as SN, CASHBOX_OPERATION} from '../../constants'
import {PUT_BUDGET, PUT_CASHBOX_OPERATION} from '../../constants/events'
import send from './index'

import pushEvents from '../pushEvents'

export default async function updateCashbox({payload}: any) {
  if (!payload._userId) {
    return Promise.reject('User must be specified.')
  }

  if (isNaN(payload.value) || payload.value < 0) {
    return Promise.reject('Incorrect input number.')
  }

  let operationSign

  if (payload.action === CASHBOX_OPERATION.ADD) {
    operationSign = 1
  } else if (payload.action === CASHBOX_OPERATION.SUBTRACT) {
    operationSign = -1
  } else {
    return Promise.reject('Update cashbox action is incorrectly specified.')
  }

  const budget: any = await getRow({storeName: SN.BUDGET, key: 1})

  const currentDate = new Date()
  const datetime = currentDate.getTime()

  const cashboxValueUpdate = budget.cashboxValue + payload.value * operationSign

  if (cashboxValueUpdate < 0) {
    return Promise.reject('You cannot withdraw more than you have.')
  }

  const budgetShapeAfterUpdate = {
    ...budget,
    cashboxValue: cashboxValueUpdate,
  }

  const newCashboxHistoryOperation = {
    id: uuidv4(),
    datetime,
    action: payload.action,
    actionValue: payload.value,
    beforeValue: budget.cashboxValue,
    afterValue: cashboxValueUpdate,
    _userId: payload._userId,
  }

  const events = [
    {
      storeName: SN.BUDGET,
      cb: ({store}: any) =>
        send({
          type: PUT_BUDGET,
          payload: budgetShapeAfterUpdate,
          store,
          emitEvent: false,
        }),
    },
    {
      storeName: SN.CASHBOX_HISTORY,
      cb: ({store}: any) =>
        send({
          type: PUT_CASHBOX_OPERATION,
          payload: newCashboxHistoryOperation,
          store,
          emitEvent: false,
        }),
    },
  ]

  const [, pushEventsError] = await handleAsync(pushEvents(events))

  if (pushEventsError) {
    return Promise.reject(
      `Cannot perform cashbox operation: ${pushEventsError}`,
    )
  }

  return {
    updatedCashboxValue: cashboxValueUpdate,
    newCashboxOperation: newCashboxHistoryOperation,
  }
}
