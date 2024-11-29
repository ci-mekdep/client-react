/// <reference types="cypress" />

describe('roles', () => {
  const allPages = Cypress.env('pages')
  const principal_permissions = Cypress.env('principal_permissions')
  const organization_permissions = Cypress.env('organization_permissions')
  const admin_permissions = Cypress.env('admin_permissions')

  it('should redirect to share link if student logged in', () => {
    cy.login(Cypress.env('student_username'), Cypress.env('student_password'))
    cy.url().should('not.include', '/dashboard')
  })

  it('should redirect to share link if parent logged in', () => {
    cy.login(Cypress.env('parent_username'), Cypress.env('parent_password'))
    cy.url().should('not.include', '/dashboard')
  })

  it('should redirect to share link if teacher logged in', () => {
    cy.login(Cypress.env('teacher_username'), Cypress.env('teacher_password'))
    cy.url().should('not.include', '/dashboard')
  })

  it('check pages that are accessible by principal role', () => {
    cy.login(Cypress.env('principal_username'), Cypress.env('principal_password'))
    cy.url().should('include', '/dashboard')

    principal_permissions.forEach((page: string) => {
      cy.log(page)
      cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
      cy.url().should('include', page)
      cy.should('not.contain', 'Siziň hukugyňyz ýok')
    })

    allPages.forEach((page: string) => {
      if (!principal_permissions.includes(page)) {
        cy.log(page)
        cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
        cy.contains('Siziň hukugyňyz ýok', { timeout: 5000 }).should('be.visible')
      }
    })
  })

  it('check pages that are accessible by organization role', () => {
    cy.login(Cypress.env('organization_username'), Cypress.env('organization_password'))
    cy.url().should('include', '/dashboard')

    organization_permissions.forEach((page: string) => {
      cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
      cy.url().should('include', page)
      cy.should('not.contain', 'Siziň hukugyňyz ýok')
    })

    allPages.forEach((page: string) => {
      if (!organization_permissions.includes(page)) {
        cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
        cy.contains('Siziň hukugyňyz ýok').should('be.visible')
      }
    })
  })

  it('check pages that are accessible by admin role', () => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
    cy.url().should('include', '/dashboard')

    admin_permissions.forEach((page: string) => {
      cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
      cy.url().should('include', page)
      cy.should('not.contain', 'Siziň hukugyňyz ýok')
    })

    allPages.forEach((page: string) => {
      if (!admin_permissions.includes(page)) {
        cy.visit('http://localhost:3000' + page, { failOnStatusCode: false })
        cy.contains('Siziň hukugyňyz ýok').should('be.visible')
      }
    })
  })
})
