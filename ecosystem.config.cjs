module.exports = {
  apps: [
    {
      name: "gadgetsalalah-api",
      script: "./artifacts/api-server/dist/index.mjs",
      instances: "max", // Cluster mode: Utilizes all available CPU cores for automatic load balancing
      exec_mode: "cluster",
      max_memory_restart: "1G", // Auto-restart if any single worker exceeds 1GB RAM (VPS has 8GB)
      watch: false,
      kill_timeout: 3000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
