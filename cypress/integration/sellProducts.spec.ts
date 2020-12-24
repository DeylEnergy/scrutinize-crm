/// <reference types="cypress" />
import {
  productsMap,
  productKeys,
  salespersonName,
  customerName,
  toBuyListProducts,
  currentMonthStats,
  userStats,
  customerStats,
} from '../fixtures/sellProducts'

context('SELL PRODUCTS', () => {
  describe('Setup db', () => {
    it('Reimports IndexedDB stores', () => {
      cy.reImportDb()
    })
  })

  describe('Opens carts and create one', () => {
    it('Open carts', () => {
      cy.openCartsDialog()
    })
    it('Add new cart', () => {
      cy.addNewCart()
    })
  })

  describe('Sets cart participants', () => {
    it('Sets "Leonie" as the salesperson', () => {
      cy.setCartSalesperson(salespersonName)
    })

    it('Sets "Daphne" as the customer', () => {
      cy.setCartCustomer(customerName)
    })
  })

  describe('Adds items to the cart', () => {
    it('Opens product select', () => {
      cy.getByTestId('select-cart-product').click()
    })

    productKeys.forEach(key => {
      const {label, ...product} = productsMap[key]

      it(`Adds "${label}"`, () => {
        if (key === 'satReceiver') {
          cy.scrollCartProductSelect('bottom')
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
      it(label, () => {
        cy.checkCartItemCount({shortProductId, ...finalShape})
      })
    })

    it('Has correct total sum', () => {
      cy.getByTestId('cart-total-sum').contains(currentMonthStats.soldSum)
    })
  })

  describe('Checkout', () => {
    it('Open checkout dialog', () => {
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

  describe('Finish cart side', () => {
    it('Checks if "Confirm" button is disabled', () => {
      cy.getByTestId('cart-confirm-btn').should('has.disabled', 'true')
    })

    it('Closes carts dialog', () => {
      cy.closeCartsDialog()
    })
  })

  describe('Checks products page after update', () => {
    it('Goes to products page', () => {
      cy.visit('/merchandise/products')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, finalProduct} = productsMap[key]

      it(`Checks ${label}`, () => {
        cy.checkProductNumbers({shortProductId, ...finalProduct})
      })
    })
  })

  describe('Checks to buy list page after update', () => {
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

  describe('Checks sales page after update', () => {
    it('Goes to sales page', () => {
      cy.visit('/sales')
    })

    productKeys.forEach(key => {
      const {label, shortProductId, ...product} = productsMap[key]
      const finalShape = product.finalCart
      it(label, () => {
        cy.checkSaleItemCount({
          shortProductId,
          salespersonName,
          customerName,
          ...finalShape,
        })
      })
    })
  })

  describe('Checks stats after update', () => {
    it('Goes to stats page', () => {
      cy.visit('/stats')
    })

    it(`Checks ${currentMonthStats.value}`, () => {
      cy.checkStats(currentMonthStats)
    })
  })

  describe('Checks user stats after update', () => {
    it('Goes to users page', () => {
      cy.visit('/persons-control/users')
    })

    it(`Checks ${userStats.name}`, () => {
      cy.checkUserStats(userStats)
    })
  })

  describe('Checks customer stats after update', () => {
    it('Goes to customer page', () => {
      cy.visit('/persons-control/customers')
    })

    it(`Checks ${customerStats.name}`, () => {
      cy.checkCustomerStats(customerStats)
    })
  })
})