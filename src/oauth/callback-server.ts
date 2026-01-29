// Local HTTP server to receive OAuth callback
import { createServer, IncomingMessage, ServerResponse, Server } from 'node:http';
import { URL } from 'node:url';
import { CALLBACK_PORT, CALLBACK_PATH, CALLBACK_TIMEOUT_MS } from './constants.js';

export interface CallbackResult {
  code: string;
  state: string;
}

const SUCCESS_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    h1 { margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
    .checkmark {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>Authorization Successful!</h1>
    <p>You can close this window and return to the CLI.</p>
  </div>
</body>
</html>`;

const ERROR_HTML = (message: string) => `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    h1 { margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">✗</div>
    <h1>Authorization Failed</h1>
    <p>${message}</p>
    <p>Please try again from the CLI.</p>
  </div>
</body>
</html>`;

/**
 * Starts a local HTTP server to receive the OAuth callback.
 * Validates the state parameter for CSRF protection.
 * Returns when the callback is received or times out.
 */
export function startCallbackServer(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    let server: Server | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (server) {
        server.close();
        server = null;
      }
    };

    server = createServer((req: IncomingMessage, res: ServerResponse) => {
      // Only handle the callback path
      if (!req.url?.startsWith(CALLBACK_PATH)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      try {
        const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Handle error response from HubSpot
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(ERROR_HTML(errorDescription || error));
          cleanup();
          reject(new Error(`OAuth error: ${errorDescription || error}`));
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(ERROR_HTML('Missing authorization code or state parameter.'));
          cleanup();
          reject(new Error('Missing authorization code or state parameter'));
          return;
        }

        // Validate state for CSRF protection
        if (state !== expectedState) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(ERROR_HTML('State parameter mismatch. Possible CSRF attack.'));
          cleanup();
          reject(new Error('State parameter mismatch - possible CSRF attack'));
          return;
        }

        // Success!
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(SUCCESS_HTML);
        cleanup();
        resolve({ code, state });

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML('Internal server error'));
        cleanup();
        reject(err);
      }
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      cleanup();
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${CALLBACK_PORT} is already in use. Close any other HubSpot CLI instances and try again.`));
      } else {
        reject(new Error(`Failed to start callback server: ${err.message}`));
      }
    });

    // Set timeout for user to complete authorization
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Authorization timed out after ${CALLBACK_TIMEOUT_MS / 1000} seconds. Please try again.`));
    }, CALLBACK_TIMEOUT_MS);

    server.listen(CALLBACK_PORT, '127.0.0.1', () => {
      // Server is ready, callback URL can now be used
    });
  });
}
