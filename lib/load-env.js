// Carrega o .env.local manualmente, lendo o arquivo direto do disco.
// Isso contorna qualquer comportamento estranho do "vercel dev" com
// variáveis de ambiente — o próprio código garante que elas existem.

const fs = require('fs');
const path = require('path');

function loadEnvOnce() {
  if (process.env.__ORIGEM_SAUDE_ENV_LOADED__) return;

  const envPath = path.join(process.cwd(), '.env.local');

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');

    content.split('\n').forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) return;

      const idx = line.indexOf('=');
      if (idx === -1) return;

      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }

  process.env.__ORIGEM_SAUDE_ENV_LOADED__ = 'true';
}

module.exports = { loadEnvOnce };