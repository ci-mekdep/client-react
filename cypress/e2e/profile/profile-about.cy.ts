/// <reference types="cypress" />

describe('profile-about', () => {
  beforeEach(() => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
  })

  it('should be visible dropdown menus', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-about').should('be.visible')
    cy.getCy('dropdown-school').should('be.visible')
    cy.getCy('dropdown-security').should('be.visible')
    cy.getCy('dropdown-devices').should('be.visible')
    cy.getCy('dropdown-logout').should('be.visible')
  })

  it('should be visible user details', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-about').should('be.visible')
    cy.getCy('dropdown-about').click()
    cy.url().should('include', '/profile/about')
    cy.getCy('profile-fullname')
      .invoke('text')
      .then(text => {
        cy.wrap(text.trim()).as('fullname')
        cy.log(text.trim())
      })

    cy.get('@fullname').then(fullname => {
      cy.getCy('profile-avatar').invoke('text').should('include', fullname)
    })
  })
})
