import setupTransaction from './setupTransaction'
import {handleAsync} from '../utilities'

async function getFilter(
  storeName: string,
  filterName: string,
  filterParams: any,
) {
  const [filters] = await handleAsync(import(`./${storeName}/filters`))

  if (!filters) {
    return
  }

  const filtersParent = filters.default(filterParams)

  return filtersParent[filterName]
}

export function getRow({
  store,
  storeName,
  indexName,
  key,
}: {
  store?: any
  storeName?: string
  indexName?: string
  key: string | number
}) {
  return new Promise((resolve, reject) => {
    let selectedStore = store

    if (!selectedStore && storeName) {
      const tx = setupTransaction(storeName)

      selectedStore = tx?.objectStore(storeName)
    }

    if (indexName) {
      selectedStore = selectedStore.index(indexName)
    }

    const req = selectedStore.get(key)

    req.onsuccess = (event: any) => {
      resolve(event.target.result)
    }

    req.onerror = (error: any) => {
      reject(error)
    }
  })
}

export function getRowFromStore(
  storeName: string,
  id: any,
  store?: IDBObjectStore | null,
  tx?: IDBTransaction,
) {
  return new Promise(resolve => {
    if (!tx) {
      tx = setupTransaction(storeName, 'readonly')
    }

    if (!store) {
      // @ts-ignore
      store = tx?.objectStore(storeName)
    }

    // @ts-ignore
    store.get(id).onsuccess = function(event: any) {
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

function getCustomKeyRange(keyRange: any) {
  if (!keyRange) {
    return
  }

  // @ts-ignore
  return IDBKeyRange[keyRange.method](...keyRange.args)
}

async function collectDataDefaultFn(value: any) {
  return value
}

async function getCollectDataHandler(storeName: string) {
  const [collectData, collectDataError] = await handleAsync(
    import(`./${storeName}/collectData`),
  )
  if (collectDataError && collectDataError?.code !== 'MODULE_NOT_FOUND') {
    return Promise.reject(collectDataError)
  }

  const collectDataFn: any = collectData?.default ?? collectDataDefaultFn

  const collectDataStores = collectData?.storeNames ?? []

  return {collectDataFn, collectDataStores}
}

async function getOutputFormatFn(
  storeName: string,
  fileName: string,
  formatFnName: string,
) {
  const [outputFormatFn, outputFormatFnError] = await handleAsync(
    import(`./${storeName}/${fileName}`),
  )
  if (outputFormatFnError && outputFormatFnError?.code !== 'MODULE_NOT_FOUND') {
    return Promise.reject(outputFormatFnError)
  }

  return outputFormatFn?.[formatFnName]
}

async function setupQuery(params: any) {
  let {tx} = params
  const {
    storeName,
    indexName,
    filterBy,
    filterParams = {},
    sort,
    format,
  } = params

  const [collectData, collectDataError] = await handleAsync(
    getCollectDataHandler(storeName),
  )

  if (collectDataError) {
    return Promise.reject(collectDataError)
  }

  const {collectDataFn, collectDataStores} = collectData

  if (!tx) {
    tx = setupTransaction([storeName, ...collectDataStores], 'readonly')
  }

  const cache: any = {cartParticipants: {}}

  const primeObjectStore = tx.objectStore(storeName)
  const targetStore =
    (indexName && primeObjectStore.index(indexName)) || primeObjectStore

  let filterFn = withoutFilter
  if (filterBy) {
    const [exactFilter] = await handleAsync(
      getFilter(storeName, filterBy, filterParams),
    )

    if (exactFilter) {
      filterFn = exactFilter
    }
  }

  let sortFn
  if (sort) {
    const [_sortFn, sortFnError] = await handleAsync(
      getOutputFormatFn(storeName, 'sort', sort),
    )

    if (sortFnError) {
      return Promise.reject(sortFnError)
    }

    sortFn = _sortFn
  }

  let outputFormatFn
  if (format) {
    const [_outputFormatFn, outputFormatFnError] = await handleAsync(
      getOutputFormatFn(storeName, 'outputFormats', format),
    )

    if (outputFormatFnError) {
      return Promise.reject(outputFormatFnError)
    }

    outputFormatFn = _outputFormatFn
  }

  return {
    tx,
    primeObjectStore,
    targetStore,
    cache,
    collectDataFn,
    filterFn,
    sortFn,
    outputFormatFn,
  }
}
// TODO: Rename with more generic name
export function getAllFromIndexStore(params: any): any {
  const {indexName, limit, lastKey, customKeyRange, direction = 'next'} = params

  return new Promise(async (resolve, reject) => {
    const [querySetup, querySetupError] = await handleAsync(setupQuery(params))

    if (querySetupError) {
      return reject(querySetupError)
    }

    const {tx, targetStore, cache, collectDataFn, filterFn} = querySetup

    const keyBound =
      lastKey && (direction === 'next' ? 'lowerBound' : 'upperBound')
    const keyRange = keyBound && IDBKeyRange[keyBound](lastKey, true)

    let count = 0
    const result: any[] = []

    targetStore.openCursor(
      getCustomKeyRange(customKeyRange) ?? keyRange,
      direction,
    ).onsuccess = async (event: any) => {
      const cursor = event.target.result

      if (!cursor || count === limit) {
        return resolve(result)
      }

      const {value} = cursor

      const [, errorOnCollecting] = await handleAsync(
        collectDataFn(value, tx, cache),
      )

      if (errorOnCollecting) {
        tx.abort()
        return reject(errorOnCollecting)
      }

      if (filterFn(value)) {
        result.push(value)
        count += 1
      }

      cursor.continue()
    }
  })
}
// TODO: Rename with more generic name
export function getFullIndexStore(params: any): any {
  const {
    direction = 'next',
    filterBy,
    matchProperties = [],
    dataCollecting = true,
  } = params
  return new Promise(async (resolve, reject) => {
    const [querySetup, querySetupError] = await handleAsync(setupQuery(params))

    if (querySetupError) {
      return reject(querySetupError)
    }

    const {
      tx,
      targetStore,
      cache,
      collectDataFn,
      filterFn,
      sortFn,
      outputFormatFn,
    } = querySetup

    targetStore.getAll().onsuccess = async (event: any) => {
      let rows = event.target.result
      if (direction === 'prev') {
        rows.reverse()
      }

      if (dataCollecting && collectDataFn !== collectDataDefaultFn) {
        for (const row of rows) {
          const [, errorOnCollecting] = await handleAsync(
            collectDataFn(row, tx, cache),
          )

          if (errorOnCollecting) {
            tx.abort()
            return reject(errorOnCollecting)
          }
        }
      }

      const matchProps: any[] = Object.entries(matchProperties)

      // match properties
      if (matchProps.length) {
        rows = rows.filter((x: any) => {
          for (const [key, value] of matchProps) {
            if (x[key] !== value) {
              return false
            }
          }

          return true
        })
      }

      if (filterBy) {
        rows = rows.filter(filterFn)
      }

      if (sortFn) {
        rows = sortFn(rows)
      }

      if (outputFormatFn) {
        rows = outputFormatFn(rows)
      }

      resolve(rows)
    }
  })
}
