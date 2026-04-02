/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config()

module.exports = {
  apps: [
    {
      name: 'myfinance',
      cwd: __dirname,
      script: 'start-standalone.cjs',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
