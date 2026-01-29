import { Command } from 'commander';
import { isConfigured } from '../config.js';
import { getPortalInfo } from '../client.js';
import { createSpinner, failSpinner, succeedSpinner } from '../formatters/index.js';
import chalk from 'chalk';

export const checkCommand = new Command('check')
  .description('Verify HubSpot authentication')
  .action(async () => {
    if (!isConfigured()) {
      console.error('Not configured. Run "hs auth" first.');
      process.exit(1);
    }

    const spinner = createSpinner('Checking HubSpot connection...', {});

    try {
      const info = await getPortalInfo();
      succeedSpinner(spinner, 'Connection successful!');
      console.log(`  Portal ID: ${chalk.cyan(info.portalId)}`);
      console.log(`  Timezone:  ${info.timeZone}`);
      console.log(`  Currency:  ${info.currency}`);
    } catch (error) {
      failSpinner(spinner, 'Connection failed');
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          console.error('Invalid or expired access token. Run "hs auth" to reconfigure.');
        } else {
          console.error(error.message);
        }
      }
      process.exit(1);
    }
  });
