// PM2 Ecosystem Config für Schichtkommunikationstool
// Läuft auf Port 3069 (isoliert von Content Forge auf Port 3000)

module.exports = {
  apps: [
    {
      name: 'schichtkommunikationstool',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3069',
      cwd: '/opt/schichtkommunikationstool',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3069',
        // Database auf Port 5433 (isoliert von Content Forge DB auf 5432)
        DATABASE_URL: 'postgresql://postgres:schichtkommunikations_secure_pw_2026@localhost:5433/schichtkommunikationstool',
        // Whisper Service auf Port 8005
        WHISPER_SERVICE_URL: 'http://localhost:8005',
        // Data Root
        DATA_ROOT_PATH: '/opt/schichtkommunikationstool/data',
        // Encryption Key - WICHTIG: Ersetze mit deinem echten Key!
        // Generiere mit: openssl rand -base64 32
        ENCRYPTION_KEY: 'REPLACE_WITH_YOUR_BASE64_ENCRYPTION_KEY',
        // LLM Provider (wird später auch in DB gespeichert)
        DEFAULT_LLM_PROVIDER: 'anthropic',
        DEFAULT_LLM_API_KEY: 'REPLACE_WITH_YOUR_ANTHROPIC_API_KEY',
      },
      // Resource Limits: Niedriger als Content Forge
      max_memory_restart: '512M',
      restart_delay: 5000,
      error_file: '/opt/schichtkommunikationstool/logs/error.log',
      out_file: '/opt/schichtkommunikationstool/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-Restart bei Crashes
      autorestart: true,
      watch: false,
      // Graceful Shutdown
      kill_timeout: 5000,
    }
  ]
};
