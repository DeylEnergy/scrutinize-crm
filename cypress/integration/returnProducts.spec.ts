/// <reference types="cypress" />
import {
  productsMap,
  productKeys,
  salespersonName,
  customerName,
  currentMonthStats,
  userStats,
  suppliersStats,
  customerStats,
} from '../fixtures/returnProducts'

context('RETURN PRODUCTS', () => {
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
        if (key !== 'charger') {
          cy.scrollCartProductSelect({x: 0, y: 200})
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

  describe('Checkout', () => {
    it('Opens checkout dialog', () => {
      cy.openCartCheckoutDialog()
    })

    it('Switches to "Return" tab', () => {
      cy.getByTestId('cart-checkout-tab_Return').click()
    })

    it('Should finish correctly', () => {
      cy.getByTestId('cart-checkout-dialog').within(() => {
        cy.contains('button', /finish/i).click()
      })
    })
  })

  describe('Finishes cart side', () => {
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
