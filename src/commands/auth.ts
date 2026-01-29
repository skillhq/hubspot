import { Command } from 'commander';
import * as readline from 'node:readline';
import {
  isConfigured,
  setAccessToken,
  getConfigPath,
  getAuthMethod,
  setAuthMethod,
  getOAuthCredentials,
  setOAuthCredentials,
  clearOAuthCredentials,
  getOAuthAppConfig,
  setOAuthAppConfig,
  isTokenExpired,
  getTimeUntilExpiry,
  isOAuthConfigured,
} from '../config.js';
import { performOAuthFlow, DEFAULT_SCOPES } from '../oauth/index.js';
import { resetClient } from '../client.js';
import type { OAuthAppConfig } from '../types.js';

async function promptForToken(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter your HubSpot Private App access token: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'expired';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes} minutes`;
  }
  return `${seconds} seconds`;
}

// Main auth command - Private App Token flow (backward compatible)
export const authCommand = new Command('auth')
  .description('Configure HubSpot authentication (Private App Token or OAuth)')
  .option('-t, --token <token>', 'Private App access token (or enter interactively)')
  .action(async (options) => {
    // If no subcommand and no flags, show help
    if (!options.token && process.argv.length === 3) {
      // Just "hubspotauth" - show current status and help
      console.log('HubSpot CLI Authentication\n');

      const authMethod = getAuthMethod();
      if (authMethod === 'oauth' && isOAuthConfigured()) {
        console.log('Currently authenticated with OAuth.');
        console.log('Run "hubspotauth status" for details.\n');
      } else if (isConfigured()) {
        console.log('Currently authenticated with Private App Token.');
        console.log('Run "hubspotcheck" to verify the connection.\n');
      } else {
        console.log('Not currently authenticated.\n');
      }

      console.log('Authentication methods:');
      console.log('  hubspotauth              Configure Private App Token (interactive)');
      console.log('  hubspotauth -t <token>   Configure Private App Token (non-interactive)');
      console.log('  hubspotauth login        Authenticate with OAuth 2.0');
      console.log('  hubspotauth logout       Clear OAuth credentials');
      console.log('  hubspotauth status       Show current authentication status\n');
      return;
    }

    // Private App Token flow
    if (isConfigured() && !options.token) {
      console.log('Already configured with Private App Token.');
      console.log('Run "hubspotcheck" to verify your connection.');
      console.log(`To re-authenticate, delete ${getConfigPath()} and run "hubspotauth" again.`);
      return;
    }

    console.log('HubSpot CLI Authentication - Private App Token\n');
    console.log('To get a Private App access token:');
    console.log('1. Go to your HubSpot account Settings');
    console.log('2. Navigate to Integrations > Private Apps (under "Legacy Apps")');
    console.log('3. Create a new Private App with these scopes:\n');
    console.log('   CRM:');
    console.log('   - crm.objects.contacts.read / write');
    console.log('   - crm.objects.companies.read / write');
    console.log('   - crm.objects.deals.read / write');
    console.log('   - crm.objects.owners.read');
    console.log('   - crm.schemas.contacts.read (for custom properties)');
    console.log('   - crm.schemas.companies.read');
    console.log('   - crm.schemas.deals.read\n');
    console.log('   Tickets:');
    console.log('   - tickets (read/write)\n');
    console.log('   Settings:');
    console.log('   - account-info.security.read (for portal info)\n');
    console.log('4. Copy the access token (starts with pat-)\n');

    try {
      const token = options.token || await promptForToken();

      if (!token) {
        console.error('No token provided. Aborting.');
        process.exit(1);
      }

      // Basic validation - HubSpot tokens start with 'pat-'
      if (!token.startsWith('pat-')) {
        console.warn('Warning: Token does not start with "pat-". Make sure you\'re using a Private App token.');
      }

      setAccessToken(token);
      setAuthMethod('token');
      resetClient();
      console.log('\nAccess token saved successfully!');
      console.log('Run "hubspotcheck" to verify the connection.');
    } catch (error) {
      console.error('Authentication failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// OAuth Login subcommand
export const authLoginCommand = new Command('login')
  .description('Authenticate with HubSpot using OAuth 2.0')
  .option('--client-id <id>', 'OAuth Client ID (or set HUBSPOT_CLIENT_ID env var)')
  .option('--client-secret <secret>', 'OAuth Client Secret (or set HUBSPOT_CLIENT_SECRET env var)')
  .action(async (options) => {
    console.log('HubSpot CLI Authentication - OAuth 2.0\n');

    // Get client credentials from options, env vars, or saved config
    const clientId = options.clientId || process.env.HUBSPOT_CLIENT_ID || getOAuthAppConfig()?.clientId;
    const clientSecret = options.clientSecret || process.env.HUBSPOT_CLIENT_SECRET || getOAuthAppConfig()?.clientSecret;

    if (!clientId || !clientSecret) {
      console.log('OAuth requires a HubSpot App with Client ID and Secret.\n');
      console.log('To create a HubSpot App:');
      console.log('1. Go to https://developers.hubspot.com/');
      console.log('2. Create or select an App');
      console.log('3. Go to App Settings > Auth');
      console.log('4. Copy the Client ID and Client Secret');
      console.log('5. Add redirect URI: http://localhost:3847/callback\n');
      console.log('Then run:');
      console.log('  hubspotauth login --client-id <YOUR_CLIENT_ID> --client-secret <YOUR_SECRET>\n');
      console.log('Or set environment variables:');
      console.log('  export HUBSPOT_CLIENT_ID=<YOUR_CLIENT_ID>');
      console.log('  export HUBSPOT_CLIENT_SECRET=<YOUR_SECRET>');
      console.log('  hubspotauth login\n');
      process.exit(1);
    }

    const appConfig: OAuthAppConfig = { clientId, clientSecret };

    try {
      console.log('Starting OAuth login flow...');
      console.log('A browser window will open for HubSpot authorization.\n');

      const credentials = await performOAuthFlow(appConfig, DEFAULT_SCOPES);

      // Save credentials and app config
      setOAuthCredentials(credentials);
      setOAuthAppConfig(appConfig);
      resetClient();

      console.log('\nOAuth authentication successful!');
      console.log(`Token expires in: ${formatTimeRemaining(getTimeUntilExpiry())}`);
      console.log('Run "hubspotcheck" to verify the connection.');
    } catch (error) {
      console.error('OAuth authentication failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// OAuth Logout subcommand
export const authLogoutCommand = new Command('logout')
  .description('Clear OAuth credentials and logout')
  .action(() => {
    if (!isOAuthConfigured()) {
      console.log('Not currently authenticated with OAuth.');
      return;
    }

    clearOAuthCredentials();
    resetClient();
    console.log('OAuth credentials cleared successfully.');
    console.log('You have been logged out.');
  });

// Auth Status subcommand
export const authStatusCommand = new Command('status')
  .description('Show current authentication status')
  .action(() => {
    console.log('Authentication Status\n');

    const authMethod = getAuthMethod();

    if (authMethod === 'oauth' && isOAuthConfigured()) {
      const credentials = getOAuthCredentials();
      const timeRemaining = getTimeUntilExpiry();
      const expired = isTokenExpired();

      console.log(`  Method: OAuth 2.0`);
      console.log(`  Token status: ${expired ? 'Expired (will refresh on next request)' : 'Valid'}`);
      console.log(`  Token expires: ${expired ? 'now' : `in ${formatTimeRemaining(timeRemaining)}`}`);

      if (credentials?.scopes?.length) {
        console.log(`  Scopes: ${credentials.scopes.join(', ')}`);
      }
    } else if (isConfigured()) {
      console.log(`  Method: Private App Token`);
      console.log(`  Status: Configured`);
    } else {
      console.log('  Status: Not authenticated');
      console.log('\nTo authenticate:');
      console.log('  hubspotauth          - Use Private App Token');
      console.log('  hubspotauth login    - Use OAuth 2.0');
    }

    console.log(`\nConfig file: ${getConfigPath()}`);
  });

// Add subcommands to main auth command
authCommand.addCommand(authLoginCommand);
authCommand.addCommand(authLogoutCommand);
authCommand.addCommand(authStatusCommand);
