/// <reference types="cypress" />
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('http://localhost:3000/login')
  cy.getCy('language-select').parent().click()
  cy.get('[id="menu-language"] li[role="option"]').contains('Türkmen').click()
  cy.getCy('login-input').type(username)
  cy.getCy('password-input').type(password, { log: false })
  cy.getCy('submit-btn').click()
})

Cypress.Commands.add('getCy', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args)
})
