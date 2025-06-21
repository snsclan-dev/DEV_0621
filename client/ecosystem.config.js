module.exports = {
  apps : [
    {
      name: 'dev-client',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 50000',
      instance: 1,
      exec_mode: 'cluster',
      merge_logs: true,
    },
  ],
};