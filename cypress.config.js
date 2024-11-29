import { defineConfig } from 'cypress'

export default defineConfig({
  resolvedNodeVersion: 'bundled',
  viewportHeight: 720,
  viewportWidth: 1280,
  e2e: {}
})
