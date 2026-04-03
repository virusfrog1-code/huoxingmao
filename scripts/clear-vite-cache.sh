#!/bin/bash

# Clear Vite cache directories
echo "Clearing Vite cache..."

# Remove .vite-temp directory from node_modules
find /vercel/share/v0-project -name ".vite-temp" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove vite cache from node_modules
rm -rf /vercel/share/v0-project/node_modules/.vite* 2>/dev/null || true

# Remove dist directory to force rebuild
rm -rf /vercel/share/v0-project/artifacts/gnarp-meme-official/dist 2>/dev/null || true

echo "Cache cleared successfully!"
