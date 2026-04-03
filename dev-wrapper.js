#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Clear vite cache
const viteTempPath = path.join(__dirname, 'artifacts/gnarp-meme-official/node_modules/.vite-temp');
if (fs.existsSync(viteTempPath)) {
  fs.rmSync(viteTempPath, { recursive: true, force: true });
  console.log('[v0] Cleared Vite cache');
}

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '5173';
process.env.BASE_PATH = '/';

// Start dev server in gnarp directory
const gnarpDir = path.join(__dirname, 'artifacts/gnarp-meme-official');
const child = spawn('pnpm', ['run', 'dev'], {
  cwd: gnarpDir,
  stdio: 'inherit',
  shell: true,
});

child.on('error', (error) => {
  console.error('[v0] Dev server error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});
