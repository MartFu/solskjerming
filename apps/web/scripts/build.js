// apps/web/scripts/build.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteId = process.argv[2];

if (!siteId) {
  console.error('Usage: node scripts/build.js <siteId>');
  console.error('Example: node scripts/build.js terrassemarkise');
  process.exit(1);
}

const distDir = `dist-${siteId}`;

console.log(`🏗️  Building site: ${siteId}`);
console.log(`📁 Output: ${distDir}`);

// Clean previous build
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// Set env vars and run build
const env = {
  ...process.env,
  SITE_ID: siteId,
  DIST_DIR: distDir,
};

try {
  execSync('next build', { 
    stdio: 'inherit',
    env,
    cwd: path.join(__dirname, '..')
  });
  console.log(`✅ ${siteId} built successfully`);
} catch (error) {
  console.error(`❌ ${siteId} build failed`);
  process.exit(1);
}