/// <reference types="cypress" />

describe('profile-security', () => {
  beforeEach(() => {
    cy.login(Cypress.env('admin_username'), Cypress.env('admin_password'))
  })

  it('should visit password change page', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').should('be.visible')
    cy.getCy('dropdown-security').click()
    cy.url().should('include', '/profile/security')
  })

  it('renders the password input fields', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.getCy('old-password').should('be.visible')
    cy.getCy('new-password').should('be.visible')
    cy.getCy('confirm-new-password').should('be.visible')
  })

  it('allows toggling visibility of passwords', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.get('body').click(0, 0)
    cy.wait(1000)

    cy.getCy('old-password-toggler').click()
    cy.get('#old-password').should('have.attr', 'type', 'text')
    cy.getCy('old-password-toggler').click()
    cy.get('#old-password').should('have.attr', 'type', 'password')

    cy.getCy('new-password-toggler').click()
    cy.get('#new-password').should('have.attr', 'type', 'text')
    cy.getCy('new-password-toggler').click()
    cy.get('#new-password').should('have.attr', 'type', 'password')

    cy.getCy('confirm-new-password-toggler').click()
    cy.get('#confirm-new-password').should('have.attr', 'type', 'text')
    cy.getCy('confirm-new-password-toggler').click()
    cy.get('#confirm-new-password').should('have.attr', 'type', 'password')
  })

  it('validates that the new passwords match', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.get('body').click(0, 0)
    cy.wait(1000)

    cy.getCy('new-password').type('newPassword123')
    cy.getCy('confirm-new-password').type('differentPassword123')

    cy.getCy('submit-btn').click()

    cy.contains('Täze açar söz we barlag açar söz gabat gelenok!').should('be.visible')
  })

  it('validates that old password and new password match', () => {
    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.get('body').click(0, 0)
    cy.wait(1000)

    cy.getCy('old-password').type('newPassword123')
    cy.getCy('new-password').type('newPassword123')

    cy.getCy('submit-btn').click()

    cy.contains('Täze açar söz köne açar söz bilen gabat gelýär!').should('be.visible')
  })

  it('submits the form with valid passwords', () => {
    const newPasswd = 'test_password'
    const oldPasswd = Cypress.env('admin_password')

    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.get('body').click(0, 0)
    cy.wait(1000)

    cy.getCy('old-password').type(oldPasswd, { log: false })
    cy.getCy('new-password').type(newPasswd, { log: false })
    cy.getCy('confirm-new-password').type(newPasswd, { log: false })

    cy.getCy('submit-btn').click()

    cy.contains('Üstünlikli ýerine ýetirildi!').should('be.visible')

    cy.url().should('include', '/login')

    cy.getCy('login-input').type(Cypress.env('admin_username'))
    cy.getCy('password-input').type(newPasswd, { log: false })
    cy.getCy('submit-btn').click()

    cy.getCy('profile-avatar').click()
    cy.getCy('dropdown-security').click()
    cy.get('body').click(0, 0)
    cy.wait(1000)

    cy.getCy('old-password').type(newPasswd, { log: false })
    cy.getCy('new-password').type(oldPasswd, { log: false })
    cy.getCy('confirm-new-password').type(oldPasswd, { log: false })

    cy.getCy('submit-btn').click()
    cy.contains('Üstünlikli ýerine ýetirildi!').should('be.visible')
  })
})
