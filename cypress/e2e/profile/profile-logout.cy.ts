/// <reference types="cypress" />

describe('profile-logout', () => {
  beforeEach(() => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
  })

  it('should logout', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-logout').should('be.visible')
    cy.getCy('dropdown-logout').click()
    cy.url().should('include', '/login')
  })
})
