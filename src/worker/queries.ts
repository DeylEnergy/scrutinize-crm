import setupTransaction from './setupTransaction'
import {handleAsync} from '../utilities'

async function getFilter(storeName: string, filterName: string) {
  const [filters] = await handleAsync(import(`./${storeName}/filters`))

  let applyFilter

  if (filters && filters.default) {
    applyFilter = filters.default[filterName]
  } else if (filters && filters[filterName]) {
    applyFilter = filters[filterName]
  }

  return applyFilter
}

export function getRowFromStore(
  storeName: string,
  id: string | number,
  store?: IDBObjectStore,
) {
  return new Promise(resolve => {
    if (!store) {
      const tx = setupTransaction(storeName, 'readonly')
      // @ts-ignore
      store = tx?.objectStore(storeName)
    }

    // @ts-ignore
    store.get(id).onsuccess = function(event: any) {
      resolve(event.target.result)
    }
  })
}

export function getRowFromIndexStore(params: {
  storeName: string
  indexName: string
  key: string
}) {
  const {storeName, indexName, key} = params
  return new Promise((resolve, reject) => {
    const {objectStore} = setupTransaction(storeName, 'readonly', true)

    const indexStore = objectStore.index(indexName)

    if (!indexStore) {
      return reject('No index found')
    }

    indexStore.get(key).onsuccess = async (event: any) => {
      resolve(event.target.result)
    }
  })
}

export function getFullStore(storeName: string) {
  return new Promise(resolve => {
    const {objectStore} = setupTransaction(storeName, 'readonly', true)

    objectStore.getAll().onsuccess = function(event: any) {
      resolve(event.target.result)
    }
  })
}

function withoutFilter(includeAll = true) {
  return includeAll
}

async function aggregate({rows, params}: any) {
  const {storeName} = params

  const [aggregateFn, noAggregator] = await handleAsync(
    import(`./${storeName}/aggregate`),
  )

  if (noAggregator) {
    return rows
  }

  if (aggregateFn.default) {
    return aggregateFn.default({rows, params})
  }
}

export function getAllFromIndexStore(params: any) {
  const {
    storeName,
    indexName,
    limit,
    lastKey,
    direction = 'next',
    filterBy,
  } = params

  return new Promise(resolve => {
    const {objectStore} = setupTransaction(storeName, 'readonly', true)

    const indexStore = objectStore.index(indexName)

    const keyBound =
      lastKey && (direction === 'next' ? 'lowerBound' : 'upperBound')
    const keyRange = keyBound && IDBKeyRange[keyBound](lastKey, true)

    let count = 0
    const result: any[] = []

    indexStore.openCursor(keyRange, direction).onsuccess = async (
      event: any,
    ) => {
      const cursor = event.target.result

      if (!cursor || count === limit) {
        return resolve({rows: result, params})
      }

      let filterFn = withoutFilter
      if (filterBy) {
        const [exactFilter] = await handleAsync(getFilter(storeName, filterBy))

        if (exactFilter) {
          filterFn = exactFilter
        }
      }

      const {value} = cursor
      if (filterFn(value)) {
        result.push(value)
        count += 1
      }

      cursor.continue()
    }
  }).then(aggregate)
}

export function getFullIndexStore(params: any) {
  const {storeName, indexName, direction = 'next', filterBy} = params
  return new Promise(resolve => {
    const {objectStore} = setupTransaction(storeName, 'readonly', true)

    const indexStore = objectStore.index(indexName)

    indexStore.getAll().onsuccess = async (event: any) => {
      let rows = event.target.result
      if (direction === 'prev') {
        rows.reverse()
      }

      if (filterBy) {
        const [filterFn] = await handleAsync(getFilter(storeName, filterBy))

        if (filterFn) {
          rows = rows.filter(filterFn)
        }
      }

      resolve({rows, params})
    }
  }).then(aggregate)
}
