/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  trailingSlash: false,
  reactStrictMode: false,
  sentry: { hideSourceMaps: true },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    config.plugins = [
      ...config.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, './node_modules/pdfjs-dist/build/pdf.worker.min.js'),
            to: path.join(__dirname, 'public')
          }
        ]
      })
    ]

    return config
  }
}

const sentryWebpackPluginOptions = {}

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
