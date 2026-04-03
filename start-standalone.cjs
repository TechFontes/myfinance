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

  // Graceful shutdown: allow in-flight requests to complete before exiting
  function shutdown(signal) {
    console.log(`Received ${signal}, shutting down gracefully...`)
    // Give active connections time to drain before forcing exit
    setTimeout(() => {
      console.log('Shutdown timeout reached, forcing exit')
      process.exit(0)
    }, 4000)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

module.exports = {
  loadStandaloneRuntime,
}
