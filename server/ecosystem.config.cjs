/**
 * PM2 进程配置(随部署脚本上传到服务器 /www/zcl-flow)
 *
 * 注意:
 * - cwd 必须是 /www/zcl-flow,后端 SQLite 路径(DATABASE_PATH=data/...)
 *   基于 process.cwd() 解析,cwd 错了会生成新的空数据库。
 * - 业务配置(PORT / JWT_SECRET / LLM_API_KEY 等)全部来自同目录 .env,
 *   这里不重复定义,避免两处不一致。
 */
module.exports = {
  apps: [
    {
      name: 'zcl-flow',
      script: 'dist/main.js',
      cwd: '/www/zcl-flow',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/www/zcl-flow/logs/out.log',
      error_file: '/www/zcl-flow/logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
