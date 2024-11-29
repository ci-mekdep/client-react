/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): void
    getCy(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
  }
}
