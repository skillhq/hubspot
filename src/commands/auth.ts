import { Command } from 'commander';
import { isConfigured, setAccessToken, getConfigPath } from '../config.js';
import * as readline from 'node:readline';

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

export const authCommand = new Command('auth')
  .description('Configure HubSpot Private App access token')
  .option('-t, --token <token>', 'Access token (or enter interactively)')
  .action(async (options) => {
    if (isConfigured()) {
      console.log('Already configured. Run "hs check" to verify your connection.');
      console.log(`To re-authenticate, delete ${getConfigPath()} and run "hs auth" again.`);
      return;
    }

    console.log('HubSpot CLI Authentication\n');
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
      console.log('\nAccess token saved successfully!');
      console.log('Run "hs check" to verify the connection.');
    } catch (error) {
      console.error('Authentication failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
