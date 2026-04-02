/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path')
const dotenv = require('dotenv')

function loadStandaloneRuntime(rootDir = __dirname) {
  const envPath = path.join(rootDir, '.env')

  dotenv.config({ path: envPath })

  process.env.NODE_ENV = process.env.NODE_ENV || 'production'
  process.env.PORT = process.env.PORT || '3000'
  process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0'

  return {
    envPath,
    serverPath: path.join(rootDir, '.next', 'standalone', 'server.js'),
  }
}

if (require.main === module) {
  const runtime = loadStandaloneRuntime()
  require(runtime.serverPath)
}

module.exports = {
  loadStandaloneRuntime,
}
