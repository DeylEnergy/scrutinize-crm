/// <reference types="cypress" />
import {
  productsMap,
  productKeys,
  newProduct,
  executorName,
  supplierName,
  currentPeriod,
  currentMonthStats,
  userStats,
  suppliersStats,
  funds,
} from '../fixtures/acquireProducts'
import {getLabel, getCellShortProductId} from '../helpers'
import {TEST_DATA_ATTR} from '../../src/constants'

context('ACQUIRE PRODUCTS', () => {
  describe('Sets up db', () => {
    it('reimports IndexedDB stores', () => {
      cy.reImportDb()
    })
  })

  describe('Adds products', () => {
    it('goes to to buy list page', () => {
      cy.visit('/merchandise/to-buy-list')
    })

    productKeys.forEach(key => {
      if (key === 'newProduct') {
        return
      }

      const {name, model} = productsMap[key]
      const label = getLabel(name, model)

      it(`selects "${label}"`, () => {
        cy.getByTestId('to-buy-add-product-btn')
          .click()
          .getByTestId('select-menu-options-list')
          .should('be.visible')
          .within(() => cy.contains('div', label).click())
      })
    })
  })

  describe('Adds new product', () => {
    it('tries adding non-exist product', () => {
      cy.getByTestId('to-buy-add-product-btn')
        .click({force: true})
        .getByTestId('select-menu-search-input')
        .type(newProduct.name)
        .getByTestId('to-buy-add-new-product-btn')
        .click()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {shortProductId, sum, finalProduct, ...inputValues} = newProduct

      const inputNames = Object.keys(inputValues)

      inputNames.forEach(inputName => {
        cy.get(`input[name=${inputName}]`).type(
          `{selectall}{backspace}${newProduct[inputName]}`,
        )
      })

      cy.getByTestId('sidesheet-save-btn').click()
    })

    it('successfully added to the list', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {finalProduct, ...cells} = newProduct
      Object.keys(cells).forEach(cellName => {
        if (cellName === 'shortProductId') {
          return
        }

        cy.get(`[${TEST_DATA_ATTR}*=to-buy-item-${cellName}_new]`).contains(
          newProduct[cellName],
        )
      })
    })
  })

  describe('Manually changes count', () => {
    const {name, model} = productsMap.computerFan
    const label = getLabel(name, model)
    it(`sets "${label}" count to 8`, () => {
      cy.changeAcquiringProductCount({
        shortProductId: productsMap.computerFan.shortProductId,
        count: 8,
      })
    })
  })

  describe('Ticks off all items', () => {
    productKeys.reverse().forEach(key => {
      const {name, model, shortProductId} = productsMap[key]

      const label = getLabel(name, model)

      it(`ticks ${label}`, () => {
        cy.get(`[${TEST_DATA_ATTR}*=to-buy-item-checkbox_${shortProductId}]`)
          .should('be.visible')
          .click()
      })
    })
  })

  describe('Checks numbers', () => {
    Object.keys(funds).forEach(fundTypeKey => {
      const value = funds[fundTypeKey]
      it(`"${fundTypeKey}" should be ${value}`, () => {
        cy.getByTestId(`to-buy-funds_${fundTypeKey}`).contains(value)
      })
    })
  })

  describe('Selects participants', () => {
    it('Scrolls table to the right', () => {
      cy.get('.virtual-table-parent').scrollTo('right')
    })

    productKeys.reverse().forEach(key => {
      const {name, model, shortProductId} = productsMap[key]

      const label = getLabel(name, model)

      it(`selects ${supplierName} as supplier for "${label}"`, () => {
        cy.selectAcquiringProductParticipant({
          role: 'supplier',
          shortProductId,
          name: supplierName,
        })
      })

      it(`selects ${executorName} as executor for "${label}"`, () => {
        cy.selectAcquiringProductParticipant({
          role: 'executor',
          shortProductId,
          name: executorName,
        })
      })
    })
  })

  describe('Finishes acquiring', () => {
    it('opens processing dialog', () => {
      cy.getByTestId('to-buy-list-options-btn').click()
    })

    it('successfully finishes processing', () => {
      cy.getByTestId('process-bought-items-btn')
        .click()
        .getByTestId('to-buy-list-continue-processing-btn')
        .click()
        .getByTestId('to-buy-list-processing-success')
        .should('has.length', 2)
    })

    it('closes processing dialog', () => {
      cy.getByTestId('to-buy-list-process-dialog').within(() => {
        cy.get('[data-icon=cross]').click()
      })
    })
  })

  describe('Checks acquisitions page', () => {
    it('goes to acquisitions page', () => {
      cy.visit('/merchandise/acquisitions')
    })

    it('selects this month filter', function() {
      cy.getByTestId('filters-popover-btn')
        .click()
        .getByTestId('select-period')
        .within(() => {
          cy.get('select').select(currentPeriod)
        })
    })

    productKeys.forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {shortProductId, name, model, finalProduct} = productsMap[key]

      const label = getLabel(name, model)

      const {acquiredCount, spentSum} = finalProduct.currentMonth

      it(`inspects ${label}`, () => {
        ;[name, model, acquiredCount, spentSum].forEach(cellValue =>
          cy.contains(cellValue),
        )
      })
    })
  })

  describe('Checks products page', () => {
    it('goes to products page', () => {
      cy.visit('/merchandise/products')
    })

    productKeys.reverse().forEach(key => {
      const {name, model, finalProduct, ...product} = productsMap[key]
      const label = getLabel(name, model)

      let shortProductId = product.shortProductId

      it(`Inspects ${label}`, () => {
        if (shortProductId === 'new') {
          cy.contains(name).then(res => {
            shortProductId = getCellShortProductId(res)
          })
        }
        cy.checkProductNumbers({shortProductId, ...finalProduct})
      })
    })
  })

  describe('Checks stats', () => {
    it('goes to stats page', () => {
      cy.visit('/stats')
    })

    it(`inspects ${currentMonthStats.value}`, () => {
      cy.checkStats(currentMonthStats)
    })
  })

  describe('Checks user stats', () => {
    it('goes to users page', () => {
      cy.visit('/persons-control/users')
    })

    it(`inspects ${userStats.name}`, () => {
      cy.checkUserStats(userStats)
    })
  })

  describe('Checks suppliers', () => {
    it('goes to suppliers page', () => {
      cy.visit('/persons-control/suppliers')
    })

    suppliersStats.forEach(supplierStats => {
      it(`inspects ${supplierStats.name}`, () => {
        cy.checkSupplierStats(supplierStats)
      })
    })
  })
})
