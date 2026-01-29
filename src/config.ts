import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import JSON5 from 'json5';
import type { AuthMethod, OAuthCredentials, OAuthAppConfig } from './types.js';
import { TOKEN_REFRESH_BUFFER_MS } from './oauth/constants.js';

export interface HsConfig {
  accessToken?: string;
  portalId?: string;
  defaultFormat?: 'plain' | 'json' | 'markdown';
  defaultLimit?: number;
  // OAuth fields
  authMethod?: AuthMethod;
  oauth?: OAuthCredentials;
  oauthApp?: OAuthAppConfig;
}

const DEFAULT_CONFIG: HsConfig = {
  defaultFormat: 'plain',
  defaultLimit: 20,
};

// Cache loaded config to avoid repeated file I/O
let cachedConfig: HsConfig | null = null;
let cachedConfigTime: number = 0;
const CONFIG_CACHE_TTL_MS = 1000; // 1 second cache

function getGlobalConfigPath(): string {
  return join(homedir(), '.config', 'hs', 'config.json5');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readConfigFile(path: string, warn: (message: string) => void): Partial<HsConfig> {
  if (!existsSync(path)) {
    return {};
  }
  try {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON5.parse(raw);

    // Validate that parsed result is a plain object
    if (!isPlainObject(parsed)) {
      warn(`Config at ${path} must be an object, got ${typeof parsed}`);
      return {};
    }

    return parsed as Partial<HsConfig>;
  } catch (error) {
    warn(`Failed to parse config at ${path}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}

export function loadConfig(warn: (message: string) => void = console.warn): HsConfig {
  // Return cached config if still valid
  const now = Date.now();
  if (cachedConfig && (now - cachedConfigTime) < CONFIG_CACHE_TTL_MS) {
    return cachedConfig;
  }

  const globalPath = getGlobalConfigPath();

  // Only load from global config - local config disabled for security
  cachedConfig = {
    ...DEFAULT_CONFIG,
    ...readConfigFile(globalPath, warn),
  };
  cachedConfigTime = now;

  return cachedConfig;
}

export function saveConfig(config: Partial<HsConfig>): void {
  const path = getGlobalConfigPath();
  const dir = dirname(path);

  // Create directory with restrictive permissions (owner only)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  // Load existing config and merge, with proper error handling
  let existing: Partial<HsConfig> = {};
  if (existsSync(path)) {
    try {
      const raw = readFileSync(path, 'utf8');
      const parsed = JSON5.parse(raw);
      if (isPlainObject(parsed)) {
        existing = parsed as Partial<HsConfig>;
      }
    } catch (error) {
      // Log but don't fail - we'll overwrite with new config
      console.warn(`Warning: Could not read existing config, will be overwritten: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const merged = { ...existing, ...config };
  const content = JSON5.stringify(merged, null, 2);

  // Write with restrictive permissions (owner read/write only)
  writeFileSync(path, content, { encoding: 'utf8', mode: 0o600 });

  // Invalidate cache
  cachedConfig = null;
}

export function getConfigPath(): string {
  return getGlobalConfigPath();
}

export function isConfigured(): boolean {
  const config = loadConfig(() => {});
  return (config.accessToken ?? '') !== '';
}

export function setAccessToken(token: string): void {
  saveConfig({ accessToken: token });
}

export function getAccessToken(): string | undefined {
  const config = loadConfig(() => {});
  return config.accessToken;
}

export function setPortalId(portalId: string): void {
  saveConfig({ portalId });
}

export function getPortalId(): string | undefined {
  const config = loadConfig(() => {});
  return config.portalId;
}

export function getDefaultLimit(): number {
  const config = loadConfig(() => {});
  return config.defaultLimit ?? 20;
}

// OAuth Configuration Functions

export function getAuthMethod(): AuthMethod {
  const config = loadConfig(() => {});
  return config.authMethod ?? 'token';
}

export function setAuthMethod(method: AuthMethod): void {
  saveConfig({ authMethod: method });
}

export function getOAuthCredentials(): OAuthCredentials | undefined {
  const config = loadConfig(() => {});
  return config.oauth;
}

export function setOAuthCredentials(credentials: OAuthCredentials): void {
  saveConfig({ oauth: credentials, authMethod: 'oauth' });
}

export function clearOAuthCredentials(): void {
  const path = getGlobalConfigPath();
  if (!existsSync(path)) {
    return;
  }

  try {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON5.parse(raw);
    if (isPlainObject(parsed)) {
      delete parsed.oauth;
      delete parsed.authMethod;
      delete parsed.oauthApp;
      const content = JSON5.stringify(parsed, null, 2);
      writeFileSync(path, content, { encoding: 'utf8', mode: 0o600 });
      // Invalidate cache
      cachedConfig = null;
    }
  } catch {
    // Ignore errors - config will be recreated on next save
  }
}

export function getOAuthAppConfig(): OAuthAppConfig | undefined {
  const config = loadConfig(() => {});
  return config.oauthApp;
}

export function setOAuthAppConfig(appConfig: OAuthAppConfig): void {
  saveConfig({ oauthApp: appConfig });
}

export function isTokenExpired(): boolean {
  const credentials = getOAuthCredentials();
  if (!credentials) {
    return true;
  }
  // Consider expired if within the refresh buffer
  return Date.now() >= (credentials.expiresAt - TOKEN_REFRESH_BUFFER_MS);
}

export function getTimeUntilExpiry(): number {
  const credentials = getOAuthCredentials();
  if (!credentials) {
    return 0;
  }
  return Math.max(0, credentials.expiresAt - Date.now());
}

export function isOAuthConfigured(): boolean {
  const config = loadConfig(() => {});
  return config.authMethod === 'oauth' &&
    config.oauth?.accessToken !== undefined &&
    config.oauth?.refreshToken !== undefined;
}
