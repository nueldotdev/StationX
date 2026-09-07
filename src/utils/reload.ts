import { watch } from 'chokidar';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

let reloadAmount = 0;

// Start the server as a child process
function startServer(entryFile: string): ChildProcess {
  if (reloadAmount > 0) {
    console.log(chalk.bgBlackBright(`♻️  Restarting server...`));
  } else {
    console.log(chalk.bgBlackBright(`🚀 Starting Server...`));

    // Increment the reload amount
    reloadAmount++;
  }

  const entryUrl = pathToFileURL(path.resolve(entryFile)).href;
  const bootstrap = `import(${JSON.stringify(entryUrl)}).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error && error.stack ? error.stack : '';
      const location = stack.split('\\n').find((line) => line.trim().startsWith('at '));
      console.error('\\n✖ Server failed to start');
      console.error('  ' + message);
      if (location) console.error('  ' + location.trim());
    process.exitCode = 1;
  });`;
  const server = spawn('node', ['--input-type=module', '-e', bootstrap], { stdio: 'inherit' });

  server.on('exit', (code: number | null) => {
    if (code === 0 || code === null) {
      console.log(chalk.bgBlackBright(`✅ Server stopped gracefully.`));
      console.log(chalk.bgBlackBright(`🚀 Starting Server...`));
    } else {
      console.error(chalk.red(`⚠ Server stopped unexpectedly (exit code ${code}).`));
    }
  });

  return server;
}

// Restart the server
function restartServer(serverProcess: ChildProcess, entryFile: string): ChildProcess {
  serverProcess.kill('SIGTERM'); // Gracefully stop the current server

  return startServer(entryFile); // Start a new server process
}

// Hot reload logic
function hotReload(entryFile: string): void {
  let serverProcess = startServer(entryFile);

  // Watch for file changes in the current project directory
  const watcher = watch('./', {
    ignored: /node_modules|\.git/, // Ignore these directories
    persistent: true,
  });

  watcher.on('change', (file: string) => {
    console.log(chalk.bgBlackBright(`\n🔃 File changed: ${file}`));
    serverProcess = restartServer(serverProcess, entryFile); // Restart the server
  });

  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('\n🚨 Terminating watcher and server 🚨');
    watcher.close();
    serverProcess.kill('SIGTERM');

    process.exit();
  });
}

export { hotReload };
