/// <reference types="cypress" />

describe('profile-devices', () => {
  beforeEach(() => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
  })

  it('should be visible sessions in profile', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-devices').should('be.visible')
    cy.getCy('dropdown-devices').click()
    cy.url().should('include', '/profile/devices')
  })

  it('checks if active session is active', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-devices').click()

    cy.getCy('session-card').contains('Häzirki enjam')
    cy.getCy('active-session-detail-btn').click()
    cy.getCy('session-detail-card').contains('Häzirki enjam')
  })

  it('validates if all sessions are removed when delete button clicked', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-devices').click()
    cy.getCy('delete-sessions').click()
    cy.getCy('dialog-submit').click()
    cy.url().should('include', '/login')
  })
})
