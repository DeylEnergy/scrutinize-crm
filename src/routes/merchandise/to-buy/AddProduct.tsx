import React from 'react'
import {Button, Pane} from 'evergreen-ui'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import GlobalContext from '../../../contexts/globalContext'

function EmptyView({onEmptyButtonClick, searchValue}: any) {
  return (
    <Pane
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        height={32}
        appearance="default"
        iconBefore="add"
        onClick={onEmptyButtonClick.bind(null, searchValue)}
      >
        Add new item
      </Button>
    </Pane>
  )
}

function AddProduct({handleSelectedProduct, handleNewProductDrawer}: any) {
  const {worker} = React.useContext(GlobalContext)

  return (
    <AsyncSelectMenu
      title="Add product"
      onSelect={handleSelectedProduct}
      searchFn={worker.search}
      storeName={'products'}
      filterFor="toBuyList"
      emptyView={(searchValue: any) => (
        <EmptyView
          onEmptyButtonClick={handleNewProductDrawer}
          searchValue={searchValue}
        />
      )}
    >
      <Button
        height={20}
        marginRight={8}
        appearance="primary"
        intent="success"
        iconBefore="add"
      >
        Add
      </Button>
    </AsyncSelectMenu>
  )
}

export default React.memo(AddProduct)
