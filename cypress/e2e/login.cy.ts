/// <reference types="cypress" />

describe('login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
    cy.getCy('language-select').parent().click()
    cy.get('[id="menu-language"] li[role="option"]').contains('Türkmen').click()
  })
  it('should load the login page', () => {
    cy.contains('Ulgama girmek').should('be.visible')
  })
  it('should display username and password input fields', () => {
    cy.getCy('login-input').should('be.visible')
    cy.getCy('password-input').should('be.visible')
  })
  it('should display validation errors for empty fields', () => {
    cy.getCy('submit-btn').click()
    cy.contains('Ulanyjy ady ýa-da telefon belgiňizi giriziň').should('be.visible')
    cy.contains('Azyndan 8 simwol bolmaly').should('be.visible')
  })
  it('should show error if password is incorrect', () => {
    cy.getCy('login-input').type(Cypress.env('admin_username'))
    cy.getCy('password-input').type('incorrect', { log: false })
    cy.getCy('submit-btn').click()
    cy.get('#password-input-helper-text').should('contain', 'Açar sözi nädogry!')
  })
  it('should login if credentials are correct', () => {
    cy.getCy('login-input').type(Cypress.env('admin_username'))
    cy.getCy('password-input').type(Cypress.env('admin_password'), { log: false })
    cy.getCy('submit-btn').click()
    cy.url().should('include', '/dashboard')
  })
  it('should obscure the password input', () => {
    cy.get('#password-input').should('have.attr', 'type', 'password')
  })
})
