import { Given, Then } from 'cypress-cucumber-preprocessor/steps'

Given('the user navigates to the index page', () => {
    cy.visit(Cypress.env('APP_URL'))
})

Then('the should be presented a home page', () => {
    cy.get('html').should('exist')
})
