// OAuth flow orchestration
import { randomBytes } from 'node:crypto';
import {
  HUBSPOT_AUTH_URL,
  HUBSPOT_TOKEN_URL,
  CALLBACK_URL,
  DEFAULT_SCOPES,
} from './constants.js';
import { startCallbackServer } from './callback-server.js';
import { openBrowser } from './browser.js';
import type { OAuthCredentials, OAuthAppConfig } from '../types.js';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Generates a cryptographically secure state parameter for CSRF protection.
 */
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Builds the HubSpot authorization URL with all required parameters.
 */
export function buildAuthorizationUrl(
  clientId: string,
  state: string,
  scopes: string[] = DEFAULT_SCOPES
): string {
  const url = new URL(HUBSPOT_AUTH_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', CALLBACK_URL);
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('state', state);
  return url.toString();
}

/**
 * Exchanges an authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(
  code: string,
  appConfig: OAuthAppConfig
): Promise<OAuthCredentials> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: appConfig.clientId,
    client_secret: appConfig.clientSecret,
    redirect_uri: CALLBACK_URL,
    code,
  });

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token exchange failed: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error_description || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json() as TokenResponse;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    tokenType: data.token_type,
    scopes: DEFAULT_SCOPES, // HubSpot doesn't return scopes in token response
  };
}

/**
 * Refreshes an expired access token using the refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string,
  appConfig: OAuthAppConfig
): Promise<OAuthCredentials> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: appConfig.clientId,
    client_secret: appConfig.clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token refresh failed: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error_description || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json() as TokenResponse;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    tokenType: data.token_type,
    scopes: DEFAULT_SCOPES,
  };
}

/**
 * Performs the full OAuth flow:
 * 1. Starts local callback server
 * 2. Opens browser to HubSpot authorization page
 * 3. Waits for callback with authorization code
 * 4. Exchanges code for tokens
 */
export async function performOAuthFlow(
  appConfig: OAuthAppConfig,
  scopes: string[] = DEFAULT_SCOPES
): Promise<OAuthCredentials> {
  const state = generateState();
  const authUrl = buildAuthorizationUrl(appConfig.clientId, state, scopes);

  // Start callback server first (before opening browser)
  const callbackPromise = startCallbackServer(state);

  // Open browser to authorization page
  console.log('Opening browser for HubSpot authorization...');
  await openBrowser(authUrl);
  console.log('Waiting for authorization...\n');
  console.log('If the browser did not open, visit this URL manually:');
  console.log(authUrl);
  console.log('');

  // Wait for callback
  const { code } = await callbackPromise;

  // Exchange code for tokens
  console.log('Exchanging authorization code for tokens...');
  const credentials = await exchangeCodeForTokens(code, appConfig);

  return credentials;
}
