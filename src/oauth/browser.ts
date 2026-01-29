// Cross-platform browser opening
import { spawn } from 'node:child_process';
import { platform } from 'node:os';

/**
 * Opens a URL in the user's default browser.
 * Works cross-platform: macOS, Windows, and Linux.
 */
export function openBrowser(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const os = platform();
    let command: string;
    let args: string[];

    switch (os) {
      case 'darwin':
        command = 'open';
        args = [url];
        break;
      case 'win32':
        command = 'cmd';
        args = ['/c', 'start', '', url];
        break;
      default:
        // Linux and other Unix-like systems
        command = 'xdg-open';
        args = [url];
        break;
    }

    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to open browser: ${error.message}`));
    });

    child.unref();

    // Give the browser a moment to start
    setTimeout(resolve, 500);
  });
}
