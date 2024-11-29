/// <reference types="cypress" />

describe('profile-school', () => {
  beforeEach(() => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
  })

  it('should be visible my school in profile', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-school').should('be.visible')
    cy.getCy('dropdown-school').click()
    cy.url().should('include', '/profile/school')
  })

  it('should be visible school when school changed', () => {
    cy.get('[data-cy="active-school"]').click()

    cy.getCy('region-select').click({ force: true }).focused().type('Aşgabat')
    cy.get('#region-select-option-0').click({ force: true })
    cy.getCy('school-select').click({ force: true }).focused().type('55')
    cy.get('#school-select-option-0').click({ force: true })

    cy.getCy('submit-btn').click()

    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-school').should('be.visible')
    cy.getCy('dropdown-school').click()
    cy.wait(1000)
    cy.url().should('include', '/profile/school')

    cy.get('[data-cy="active-school"]').then($value => {
      cy.getCy('profile-school-details').contains($value.text())
    })
  })

  it('should be visible school not selected if not', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-school').should('be.visible')
    cy.getCy('dropdown-school').click()
    cy.wait(1000)
    cy.url().should('include', '/profile/school')

    cy.get('[data-cy="active-school"]').then($value => {
      if ($value.text() === 'Ählisi') {
        cy.getCy('profile-school-details').contains('Mekdep saýlanmadyk')
      } else {
        cy.getCy('profile-school-details').contains($value.text())
      }
    })
  })
})
