/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config()

module.exports = {
  apps: [
    {
      name: 'myfinance',
      cwd: __dirname,
      script: 'start-standalone.cjs',
      exec_mode: 'fork', // standalone Next.js bundles its own server; cluster mode is not supported
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/myfinance-error.log',
      out_file: './logs/myfinance-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
