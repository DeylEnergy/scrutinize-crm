import React from 'react'
import {Button, Pane, AddIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import {useDatabase} from '../../../utilities'

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
        iconBefore={AddIcon}
        onClick={onEmptyButtonClick.bind(null, searchValue)}
      >
        Add new item
      </Button>
    </Pane>
  )
}

function AddProduct({handleSelectedProduct, handleNewProductDrawer}: any) {
  const db = useDatabase()

  return (
    <AsyncSelectMenu
      title="Add product"
      onSelect={handleSelectedProduct}
      searchFn={db.search}
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
        iconBefore={AddIcon}
      >
        Add
      </Button>
    </AsyncSelectMenu>
  )
}

export default React.memo(AddProduct)
