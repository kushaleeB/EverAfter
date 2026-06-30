import { execSync } from 'node:child_process';

const PORTS = [3001, 5173];

function killPortWindows(port) {
  const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  const pids = new Set();

  for (const line of output.split('\n')) {
    if (!line.includes('LISTENING')) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts.at(-1);
    if (pid && pid !== '0') pids.add(pid);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed port ${port} (PID ${pid})`);
    } catch {
      // Process may have already exited.
    }
  }
}

function killPortUnix(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore', shell: true });
    console.log(`Freed port ${port}`);
  } catch {
    // Port not in use.
  }
}

for (const port of PORTS) {
  try {
    if (process.platform === 'win32') {
      killPortWindows(port);
    } else {
      killPortUnix(port);
    }
  } catch {
    // Port not in use.
  }
}
