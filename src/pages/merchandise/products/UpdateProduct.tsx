import React from 'react'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {useLocale, useDatabase} from '../../../utilities'
import {PUT_PRODUCT} from '../../../constants/events'

type SideSheetType = {
  value: any
  isShown: boolean
}

type UpdateProductProps = {
  sideSheet: SideSheetType
  setSideSheet: any
  onCloseComplete: () => void
}

function isValidNumber(
  value: any,
  {isZero = true, isInteger = false, isPositive = true}: any,
) {
  if (value === '') {
    return false
  }

  const convertedNumber = Number(value)

  if (isNaN(convertedNumber)) {
    return false
  }

  if (!isZero && convertedNumber === 0) {
    return false
  }

  if (isInteger && !Number.isInteger(convertedNumber)) {
    return false
  }

  if (isPositive && convertedNumber < 0) {
    return false
  }

  return true
}

function defineInputValues(doc: any) {
  if (doc.id) {
    return {
      name: doc.nameModel[0] || '',
      model: doc.nameModel[1] || '',
      realPrice: doc.realPrice || '',
      salePrice: doc.salePrice || '',
      inStockCount: doc.inStockCount || '',
      soldCount: doc.soldCount || String(doc.soldCount),
      lowestBoundCount: doc.lowestBoundCount || '',
    }
  }

  return {
    name: doc.name || '',
    model: '',
    price: '',
    count: '',
  }
}

function doesPropertyExist(prop: any) {
  if (typeof prop !== 'undefined') {
    return true
  }
  return false
}

function UpdateProduct({
  items,
  setLoadedItems,
  serializeItem,
  sideSheet,
  setSideSheet,
  onSave = null,
  onCloseComplete,
}: any) {
  // console.log('<UpdateProduct />')
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.PRODUCTS
  const {DRAWER} = PAGE_CONST
  const {COLUMNS} = PAGE_CONST.TABLE
  const db = useDatabase()

  const doc = sideSheet.value

  const [input, setInput] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    defineInputValues(doc),
  )

  const handleInput = React.useCallback((value, e) => {
    setInput({[e.target.name]: value})
  }, [])

  const canSave = React.useCallback(
    ({
      name,
      model,
      realPrice,
      price,
      salePrice,
      inStockCount,
      soldCount,
      count,
      lowestBoundCount,
    }) => {
      if (name.length < 3) {
        return false
      }

      if (model.length < 5) {
        return false
      }

      if (
        doesPropertyExist(realPrice) &&
        !isValidNumber(realPrice, {isZero: false, isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(price) &&
        !isValidNumber(price, {isZero: false, isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(salePrice) &&
        !isValidNumber(salePrice, {isZero: false, isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(inStockCount) &&
        !isValidNumber(inStockCount, {isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(count) &&
        !isValidNumber(count, {isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(soldCount) &&
        !isValidNumber(soldCount, {isInteger: true})
      ) {
        return false
      }

      if (
        doesPropertyExist(lowestBoundCount) &&
        !isValidNumber(lowestBoundCount, {isInteger: true})
      ) {
        return false
      }

      return true
    },
    [],
  )

  const saveChanges = () => {
    if (onSave) {
      return onSave(input)
    }

    const {name, model, ...rest} = input
    const nameModel = [name, model]
    const updatedRow = {...sideSheet.value, ...rest, nameModel}
    db.sendEvent({
      type: PUT_PRODUCT,
      payload: updatedRow,
    }).then(() => {
      const foundIndex = items.findIndex((x: any) => x.id === updatedRow.id)
      items[foundIndex] = serializeItem(updatedRow)
      setLoadedItems({items: [...items]})
      setTimeout(() => setSideSheet({isShown: false}))
    })
  }

  const productExists = Boolean(doc.id)

  return (
    <SideSheet
      title={
        productExists ? DRAWER.TITLE_EDIT_PRODUCT : DRAWER.TITLE_NEW_PRODUCT
      }
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onCloseComplete={onCloseComplete}
      canSave={canSave(input)}
    >
      <pre>
        {JSON.stringify(
          input,
          [
            'name',
            'model',
            'realPrice',
            'inStockCount',
            'soldCount',
            'lowestBoundCount',
          ],
          2,
        )}
      </pre>
      <TextInputField
        name="name"
        value={input.name}
        // @ts-ignore
        onChange={handleInput}
        label={COLUMNS.NAME}
        placeholder={`${COLUMNS.NAME}...`}
        required
      />
      <TextInputField
        name="model"
        value={input.model}
        // @ts-ignore
        onChange={handleInput}
        label={COLUMNS.MODEL}
        placeholder={`${COLUMNS.MODEL}...`}
        required
      />
      <TextInputField
        type="number"
        name={productExists ? 'realPrice' : 'price'}
        value={productExists ? input.realPrice : input.price}
        // @ts-ignore
        onChange={handleInput}
        label={productExists ? COLUMNS.REAL_PRICE : DRAWER.INPUTS.EXPECTED_COST}
        placeholder="1000"
        required
      />
      {productExists && (
        <TextInputField
          type="number"
          name="salePrice"
          value={input.salePrice}
          // @ts-ignore
          onChange={handleInput}
          label={COLUMNS.SALE_PRICE}
          placeholder="1000"
          required
        />
      )}
      <TextInputField
        type="number"
        name={productExists ? 'inStockCount' : 'count'}
        value={productExists ? input.inStockCount : input.count}
        // @ts-ignore
        onChange={handleInput}
        label={productExists ? COLUMNS.IN_STOCK : DRAWER.INPUTS.COUNT}
        placeholder="99"
        required
      />
      {productExists && (
        <TextInputField
          type="number"
          name="soldCount"
          value={input.soldCount}
          // @ts-ignore
          onChange={handleInput}
          label={COLUMNS.SOLD}
          placeholder="99"
          required
        />
      )}
      {productExists && (
        <TextInputField
          type="number"
          name="lowestBoundCount"
          value={input.lowestBoundCount}
          // @ts-ignore
          onChange={handleInput}
          label={COLUMNS.LOWEST_BOUND}
          placeholder="10"
          required
        />
      )}
    </SideSheet>
  )
}

export default React.memo(UpdateProduct)
