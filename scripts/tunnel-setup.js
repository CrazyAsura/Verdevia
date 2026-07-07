/**
 * Antigravity Tunnel Provisioning System
 * 
 * Architecture:
 * This script automates the creation of a secure tunnel to the backend service.
 * It leverages ngrok to expose port 3333 to the public internet, enabling
 * physical mobile devices to communicate with the local development environment.
 * 
 * Rationale:
 * Cross-environment connectivity is often a bottleneck in design-driven mobile engineering.
 * By automating this, we ensure a "Zero Friction" developer experience.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration constants based on the Antigravity RFC
const BACKEND_PORT = 3333;
const MOBILE_ENV_PATH = path.join(__dirname, '..', 'VERDEVIA-MOBILE', '.env');

console.log('\x1b[35m%s\x1b[0m', 'Initializing Antigravity Secure Tunnel...');

// 1. Check if ngrok is available
exec('npx ngrok http ' + BACKEND_PORT + ' --log=stdout', (error) => {
  if (error) {
    console.error('Error starting ngrok:', error.message);
    console.log('Ensure ngrok is installed or run: npm install -g ngrok');
  }
});

// Since ngrok usually opens an interactive terminal or a dashboard,
// we provide instructions to the user on how to sync the URL.

console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
console.log('Action Required:');
console.log('1. Run: npx ngrok http ' + BACKEND_PORT);
console.log('2. Copy the "Forwarding" URL (e.g., https://xxxx.ngrok-free.app)');
console.log('3. Update VERDEVIA-MOBILE/.env: EXPO_PUBLIC_API_URL=your-url');
console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
