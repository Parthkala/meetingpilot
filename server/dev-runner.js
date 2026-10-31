const { spawn } = require('child_process');
const path = require('path');

const NODE = process.execPath;
const ROOT = path.resolve(__dirname, '..');
const SERVER_ARGS = ['--experimental-sqlite', path.join(ROOT, 'server', 'index.js')];
const VITE = path.join(ROOT, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const VITE_ARGS = [VITE, '--config', path.join(ROOT, 'client', 'vite.config.js')];

function run(label, args) {
  const child = spawn(NODE, args, { cwd: ROOT, stdio: 'pipe', shell: false });
  child.stdout.on('data', d => process.stdout.write(`[${label}] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[${label}] ${d}`));
  child.on('exit', code => {
    console.log(`[${label}] exited with code ${code}`);
    process.exit(code || 1);
  });
  return child;
}

const server = run('server', SERVER_ARGS);
const vite = run('vite', VITE_ARGS);

process.on('SIGINT', () => { server.kill(); vite.kill(); process.exit(0); });
process.on('SIGTERM', () => { server.kill(); vite.kill(); process.exit(0); });
