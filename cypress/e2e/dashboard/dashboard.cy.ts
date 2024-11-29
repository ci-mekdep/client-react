/// <reference types="cypress" />

describe('dashboard', () => {
  it('should redirect to login page if student visits dashboard', () => {
    cy.login(Cypress.env('student_username'), Cypress.env('student_password'))
    cy.visit('http://localhost:3000/dashboard')
    cy.url().should('include', '/login')
  })

  it('should redirect to login page if parent visits dashboard', () => {
    cy.login(Cypress.env('parent_username'), Cypress.env('parent_password'))
    cy.visit('http://localhost:3000/dashboard')
    cy.url().should('include', '/login')
  })

  it('should redirect to login page if teacher visits dashboard', () => {
    cy.login(Cypress.env('teacher_username'), Cypress.env('teacher_password'))
    cy.visit('http://localhost:3000/dashboard')
    cy.url().should('include', '/login')
  })

  it('check pages that are accessible by principal role', () => {
    cy.login(Cypress.env('principal_username'), Cypress.env('principal_password'))
    cy.url().should('include', '/dashboard')
    cy.getCy('dashboard-stats-card', { timeout: 15000 }).each($element => {
      cy.wrap($element)
        .invoke('text')
        .then(text => {
          expect(text).to.match(/\d+/)
        })
    })

    cy.getCy('dashboard-birthday-card').then($body => {
      if ($body.find('[data-cy="dashboard-birthday-table"]').length > 0) {
        cy.get('[data-cy="dashboard-birthday-table"] tbody tr').should('have.length.greaterThan', 0)
      } else {
        cy.contains('Maglumat ýok').should('exist')
      }
    })

    cy.get('#dashboard-table', { timeout: 15000 }).should('be.visible')
    cy.get('#dashboard-table thead th').as('tableHeaders')
    cy.get('@tableHeaders').eq(0).invoke('text').should('include', 'T/b')
    cy.get('@tableHeaders').eq(1).invoke('text').should('include', 'Mugallym')
    cy.get('@tableHeaders').eq(2).invoke('text').should('include', 'Sagat sany')
    cy.get('@tableHeaders').eq(3).invoke('text').should('include', 'Doly')
    cy.get('@tableHeaders').eq(4).invoke('text').should('include', 'Doly däl')
    cy.get('@tableHeaders').eq(5).invoke('text').should('include', 'Dolylyk %')
  })

  it('check pages that are accessible by organization role', () => {
    cy.login(Cypress.env('organization_username'), Cypress.env('organization_password'))
    cy.url().should('include', '/dashboard')
    cy.getCy('dashboard-stats-card', { timeout: 15000 }).each($element => {
      cy.wrap($element)
        .invoke('text')
        .then(text => {
          expect(text).to.match(/\d+/)
        })
    })

    cy.get('#dashboard-table', { timeout: 20000 }).should('be.visible')
    cy.get('#dashboard-table thead th').as('tableHeaders')
    cy.get('@tableHeaders').eq(0).invoke('text').should('include', 'Etrap')
    cy.get('@tableHeaders').eq(1).invoke('text').should('include', '')
    cy.get('@tableHeaders').eq(2).invoke('text').should('include', 'Mekdep')
    cy.get('@tableHeaders').eq(3).invoke('text').should('include', 'Okuwçy sany')
    cy.get('@tableHeaders').eq(4).invoke('text').should('include', 'Geçilen sapaklar')
    cy.get('@tableHeaders').eq(5).invoke('text').should('include', 'Žurnallaryň dolulygy')
  })

  it('check pages that are accessible by admin role', () => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
    cy.url().should('include', '/dashboard')
    cy.getCy('dashboard-stats-card', { timeout: 15000 }).each($element => {
      cy.wrap($element)
        .invoke('text')
        .then(text => {
          expect(text).to.match(/\d+/)
        })
    })

    cy.get('#dashboard-table', { timeout: 25000 }).should('be.visible')
    cy.get('#dashboard-table thead th').as('tableHeaders')
    cy.get('@tableHeaders').eq(0).invoke('text').should('include', 'Etrap')
    cy.get('@tableHeaders').eq(1).invoke('text').should('include', '')
    cy.get('@tableHeaders').eq(2).invoke('text').should('include', 'Mekdep')
    cy.get('@tableHeaders').eq(3).invoke('text').should('include', 'Okuwçy sany')
    cy.get('@tableHeaders').eq(4).invoke('text').should('include', 'Geçilen sapaklar')
    cy.get('@tableHeaders').eq(5).invoke('text').should('include', 'Žurnallaryň dolulygy')
  })
})
