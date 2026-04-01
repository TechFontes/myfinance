module.exports = {
  apps: [
    {
      name: 'myfinance',
      cwd: __dirname,
      script: '.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
