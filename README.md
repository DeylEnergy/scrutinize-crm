## Intro

The app built for the management of a store that sells electronics. The basic
idea of the app is qr code stickers on the products, which technically allows to
keep the track of sales.

## Showcase

### Authorization with qr code

![Authorization with qr code](demo/auth.gif)

### Add products to the cart through scanning qr code

![Add products to the cart through scanning qr code](demo/scan-product.gif)

### Add products with popover select

![Add products with popover select](demo/manual-product-select.gif)

### Search in products ![Search in products](demo/product-search.gif)

### Easy management of buy list

![Easy management of buy list](demo/add-to-buy-list.gif)

### Manage qr code stickers ![Manage qr code stickers](demo/stickers-manager.gif)

### Restrict users ![Restrict users](demo/user-groups.gif)

_...and more_

## Tech used

- React
- Typescript (ready, but not type safe yet)
- Evergreen UI
- Styled Components
- React-window
- IndexedDB
- Web workers
- Electron
- Cypress for e2e tests

## Try in production

1. Go to https://scrutinize-crm.netlify.app/
2. In the setup wizard select "Generate dummy data" checkbox to fill out the app
   with demo data

## Warning

`This version is tested only on Google Chrome, it may not fully work on Firefox.`
