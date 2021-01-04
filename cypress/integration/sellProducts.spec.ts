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
    it('reimports IndexedDB stores', () => {
      cy.reImportDb()
    })
  })

  describe('Opens carts and create one', () => {
    it('opens carts', () => {
      cy.openCartsDialog()
    })
    it('adds new cart', () => {
      cy.addNewCart()
    })
  })

  describe('Selects cart participants', () => {
    it(`sets "${salespersonName}" as the salesperson`, () => {
      cy.setCartSalesperson(salespersonName)
    })

    it(`sets "${customerName}" as the customer`, () => {
      cy.setCartCustomer(customerName)
    })
  })

  describe('Adds items to the cart', () => {
    it('opens product select', () => {
      cy.getByTestId('select-cart-product').click()
    })

    productKeys.forEach(key => {
      const {label, ...product} = productsMap[key]

      it(`selects "${label}"`, () => {
        if (key === 'satReceiver') {
          cy.scrollCartProductSelect({position: 'bottom'})
        }
        cy.addItemToCart(product)
      })
    })

    it('closes "Select Product"', () => {
      cy.getByTestId('close-select-product')
        .should('be.visible')
        .click()
    })
  })

  describe('Manually changes count', () => {
    it('sets "Battery" count to 6', () => {
      cy.changeCartItemCount({
        shortProductId: productsMap.battery.shortProductId,
        count: 6,
      })
    })

    it('sets "Earphones" count to 2', () => {
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
      it(`verifies ${label}`, () => {
        cy.checkCartItemCount({shortProductId, ...finalShape})
      })
    })

    it('has correct total sum', () => {
      cy.getByTestId('cart-total-sum').contains(currentMonthStats.soldSum)
    })
  })

  describe('Checkout', () => {
    it('opens checkout dialog', () => {
      cy.openCartCheckoutDialog()
    })

    it('gets correct change sum', () => {
      cy.getByTestId('cart-checkout-paid-input')
        .type('22000')
        .should('has.value', '22000')

      cy.getByTestId('cart-checkout-change-input').should('has.value', '70')
    })

    it('should finish correctly', () => {
      cy.getByTestId('cart-checkout-dialog').within(() => {
        cy.contains('button', /finish/i).click()
      })
    })
  })

  describe('Finishes cart side', () => {
    it('checks if "Confirm" button is disabled', () => {
      cy.getByTestId('cart-confirm-btn').should('has.disabled', 'true')
    })

    it('closes carts dialog', () => {
      cy.closeCartsDialog()
    })
  })

  describe('Checks products page', () => {
    it('goes to products page', () => {
      cy.visit('/merchandise/products')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, finalProduct} = productsMap[key]

      it(`inspects ${label}`, () => {
        cy.checkProductNumbers({shortProductId, ...finalProduct})
      })
    })
  })

  describe('Checks to buy list page', () => {
    it('should add two products in to buy list', () => {
      cy.visit('/merchandise/to-buy-list')
        .get(`[data-cy*="to-buy-item-name"]`)
        .should('have.length', 2)
    })

    toBuyListProducts.forEach(({label, shortProductId}) => {
      it(`includes "${label}"`, () => {
        cy.getByTestId(`to-buy-item-name_${shortProductId}`)
      })
    })
  })

  describe('Checks acquisitions page', () => {
    it('goes to acquisitions page', () => {
      cy.visit('/merchandise/acquisitions')
    })

    productKeys.forEach(key => {
      const {label, shortAcquisitionId, finalProduct} = productsMap[key]

      it(`inspects ${label}`, () => {
        cy.getByTestId(
          `acquisition-in-stock-count_${shortAcquisitionId}`,
        ).contains(finalProduct.inStockCount)
      })
    })
  })

  describe('Checks sales page', () => {
    it('goes to sales page', () => {
      cy.visit('/sales')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, ...product} = productsMap[key]
      const finalShape = product.finalCart
      it(`inspects ${label}`, () => {
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

  describe('Checks customer stats', () => {
    it('goes to customer page', () => {
      cy.visit('/persons-control/customers')
    })

    it(`inspects ${customerStats.name}`, () => {
      cy.checkCustomerStats(customerStats)
    })
  })
})
