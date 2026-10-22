module.exports = {
  apps: [{
    name: 'dropgames',
    script: './server/index.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: '3000',
    },
  }],
};
