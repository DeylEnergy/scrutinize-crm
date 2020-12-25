/// <reference types="cypress" />
import {
  productsMap,
  productKeys,
  salespersonName,
  customerName,
  toBuyListProducts,
  currentMonthStats,
  userStats,
  suppliersStats,
  customerStats,
} from '../fixtures/sellProducts'

context('SELL PRODUCTS', () => {
  describe('Sets up db', () => {
    it('Reimports IndexedDB stores', () => {
      cy.reImportDb()
    })
  })

  describe('Opens carts and create one', () => {
    it('Opens carts', () => {
      cy.openCartsDialog()
    })
    it('Adds new cart', () => {
      cy.addNewCart()
    })
  })

  describe('Selects cart participants', () => {
    it(`Sets "${salespersonName}" as the salesperson`, () => {
      cy.setCartSalesperson(salespersonName)
    })

    it(`Sets "${customerName}" as the customer`, () => {
      cy.setCartCustomer(customerName)
    })
  })

  describe('Adds items to the cart', () => {
    it('Opens product select', () => {
      cy.getByTestId('select-cart-product').click()
    })

    productKeys.forEach(key => {
      const {label, ...product} = productsMap[key]

      it(`Selects "${label}"`, () => {
        if (key === 'satReceiver') {
          cy.scrollCartProductSelect({position: 'bottom'})
        }
        cy.addItemToCart(product)
      })
    })

    it('Closes "Select Product"', () => {
      cy.getByTestId('close-select-product')
        .should('be.visible')
        .click()
    })
  })

  describe('Manually changes count', () => {
    it('Sets "Battery" count to 6', () => {
      cy.changeCartItemCount({
        shortProductId: productsMap.battery.shortProductId,
        count: 6,
      })
    })

    it('Sets "Earphones" count to 2', () => {
      cy.changeCartItemCount({
        shortProductId: productsMap.earphones.shortProductId,
        count: 2,
      })
    })
  })

  describe('Checks cart numbers', () => {
    productKeys.forEach(key => {
      const {label, shortProductId, ...product} = productsMap[key]
      const finalShape = product.finalCart
      it(`Verifies ${label}`, () => {
        cy.checkCartItemCount({shortProductId, ...finalShape})
      })
    })

    it('Has correct total sum', () => {
      cy.getByTestId('cart-total-sum').contains(currentMonthStats.soldSum)
    })
  })

  describe('Checkout', () => {
    it('Opens checkout dialog', () => {
      cy.openCartCheckoutDialog()
    })

    it('Gets correct change sum', () => {
      cy.getByTestId('cart-checkout-paid-input')
        .type('22000')
        .should('has.value', '22000')

      cy.getByTestId('cart-checkout-change-input').should('has.value', '70')
    })

    it('Should finish correctly', () => {
      cy.getByTestId('cart-checkout-dialog').within(() => {
        cy.contains('button', /finish/i).click()
      })
    })
  })

  describe('Finishes cart side', () => {
    it('Checks if "Confirm" button is disabled', () => {
      cy.getByTestId('cart-confirm-btn').should('has.disabled', 'true')
    })

    it('Closes carts dialog', () => {
      cy.closeCartsDialog()
    })
  })

  describe('Checks products page', () => {
    it('Goes to products page', () => {
      cy.visit('/merchandise/products')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, finalProduct} = productsMap[key]

      it(`Inspects ${label}`, () => {
        cy.checkProductNumbers({shortProductId, ...finalProduct})
      })
    })
  })

  describe('Checks to buy list page', () => {
    it('Should add two products in to buy list', () => {
      cy.visit('/merchandise/to-buy-list')
        .get(`[data-cy*="to-buy-item-name"]`)
        .should('have.length', 2)
    })

    toBuyListProducts.forEach(({label, shortProductId}) => {
      it(`Includes "${label}"`, () => {
        cy.getByTestId(`to-buy-item-name_${shortProductId}`)
      })
    })
  })

  describe('Checks acquisitions page', () => {
    it('Goes to acquisitions page', () => {
      cy.visit('/merchandise/acquisitions')
    })

    productKeys.forEach(key => {
      const {label, shortAcquisitionId, finalProduct} = productsMap[key]

      it(`Inspects ${label}`, () => {
        cy.getByTestId(
          `acquisition-in-stock-count_${shortAcquisitionId}`,
        ).contains(finalProduct.inStockCount)
      })
    })
  })

  describe('Checks sales page', () => {
    it('Goes to sales page', () => {
      cy.visit('/sales')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, ...product} = productsMap[key]
      const finalShape = product.finalCart
      it(`Inspects ${label}`, () => {
        cy.checkSaleItemCount({
          shortProductId,
          salespersonName,
          customerName,
          ...finalShape,
        })
      })
    })
  })

  describe('Checks stats', () => {
    it('Goes to stats page', () => {
      cy.visit('/stats')
    })

    it(`Inspects ${currentMonthStats.value}`, () => {
      cy.checkStats(currentMonthStats)
    })
  })

  describe('Checks user stats', () => {
    it('Goes to users page', () => {
      cy.visit('/persons-control/users')
    })

    it(`Inspects ${userStats.name}`, () => {
      cy.checkUserStats(userStats)
    })
  })

  describe('Checks suppliers', () => {
    it('Goes to suppliers page', () => {
      cy.visit('/persons-control/suppliers')
    })

    suppliersStats.forEach(supplierStats => {
      it(`Inspects ${supplierStats.name}`, () => {
        cy.checkSupplierStats(supplierStats)
      })
    })
  })

  describe('Checks customer stats', () => {
    it('Goes to customer page', () => {
      cy.visit('/persons-control/customers')
    })

    it(`Inspects ${customerStats.name}`, () => {
      cy.checkCustomerStats(customerStats)
    })
  })
})
