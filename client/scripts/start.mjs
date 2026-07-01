import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = process.env.PORT || 3000;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const serveBin = require.resolve('serve/build/main.js');

const child = spawn(
  process.execPath,
  [serveBin, '-s', 'dist', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: rootDir },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
