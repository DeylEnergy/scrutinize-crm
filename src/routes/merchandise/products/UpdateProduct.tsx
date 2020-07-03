import React from 'react'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import GlobalContext from '../../../contexts/globalContext'

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

function UpdateProduct({
  items,
  setLoadedItems,
  serializeItem,
  sideSheet,
  setSideSheet,
  onCloseComplete,
}: any) {
  // console.log('<UpdateProduct />')

  const {worker} = React.useContext(GlobalContext)

  const doc = sideSheet.value
  // @ts-ignore
  const [input, setInput] = React.useReducer((s, v) => ({...s, ...v}), {
    name: doc.nameModel[0],
    model: doc.nameModel[1],
    realPrice: doc.realPrice || '',
    salePrice: doc.salePrice || '',
    inStockCount: doc.inStockCount || '',
    soldCount: doc.soldCount || '',
    lowestBoundCount: doc.lowestBoundCount || '',
  })

  const handleInput = React.useCallback((e: any) => {
    setInput({[e.target.name]: e.target.value})
  }, [])

  const canSave = React.useCallback(
    ({
      name,
      model,
      realPrice,
      salePrice,
      inStockCount,
      soldCount,
      lowestBoundCount,
    }) => {
      if (name.length < 3) {
        return false
      }

      if (model.length < 5) {
        return false
      }

      if (!isValidNumber(realPrice, {isZero: false, isInteger: true})) {
        return false
      }

      if (!isValidNumber(salePrice, {isZero: false, isInteger: true})) {
        return false
      }

      if (!isValidNumber(inStockCount, {isInteger: true})) {
        return false
      }

      if (!isValidNumber(soldCount, {isInteger: true})) {
        return false
      }

      if (!isValidNumber(lowestBoundCount, {isInteger: true})) {
        return false
      }

      return true
    },
    [],
  )

  const saveChanges = () => {
    const {name, model, ...rest} = input
    const nameModel = [name, model]
    const updateRow = {...sideSheet.value, ...rest, nameModel}
    worker.putRow('products', updateRow).then(() => {
      const foundIndex = items.findIndex((x: any) => x.id === updateRow.id)
      items[foundIndex] = serializeItem(updateRow)
      setLoadedItems({items: [...items]})
      setTimeout(() => setSideSheet({isShown: false}))
    })
  }

  return (
    <SideSheet
      title="Edit product"
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
            'lowestBorderCount',
          ],
          2,
        )}
      </pre>
      <TextInputField
        name="name"
        value={input.name}
        // @ts-ignore
        onChange={handleInput}
        label="Name"
        placeholder="Name..."
        required
      />
      <TextInputField
        name="model"
        value={input.model}
        // @ts-ignore
        onChange={handleInput}
        label="Model"
        placeholder="Model..."
        required
      />
      <TextInputField
        name="realPrice"
        value={input.realPrice}
        // @ts-ignore
        onChange={handleInput}
        label="Real price"
        placeholder="1000"
        required
      />
      <TextInputField
        name="salePrice"
        value={input.salePrice}
        // @ts-ignore
        onChange={handleInput}
        label="Sale price"
        placeholder="1000"
        required
      />
      <TextInputField
        name="inStockCount"
        value={input.inStockCount}
        // @ts-ignore
        onChange={handleInput}
        label="In stock"
        placeholder="99"
        required
      />
      <TextInputField
        name="soldCount"
        value={input.soldCount}
        // @ts-ignore
        onChange={handleInput}
        label="Sold"
        placeholder="99"
        required
      />
      <TextInputField
        name="lowestBoundCount"
        value={input.lowestBoundCount}
        // @ts-ignore
        onChange={handleInput}
        label="Lowest Bound"
        placeholder="10"
        required
      />
    </SideSheet>
  )
}

export default React.memo(UpdateProduct)
