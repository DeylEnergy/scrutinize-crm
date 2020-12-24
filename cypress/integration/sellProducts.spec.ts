/// <reference types="cypress" />
import {
  productsMap,
  productKeys,
  salespersonName,
  customerName,
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
      cy.getByTestId('cart-total-sum').contains('11,250')
    })
  })

  describe('Checkout', () => {
    it('Open checkout dialog', () => {
      cy.openCartCheckoutDialog()
    })

    it('Gets correct change sum', () => {
      cy.getByTestId('cart-checkout-paid-input')
        .type('11500')
        .should('has.value', '11500')

      cy.getByTestId('cart-checkout-change-input').should('has.value', '250')
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
})
