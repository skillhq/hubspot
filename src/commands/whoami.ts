import { Command } from 'commander';
import { getPortalInfo } from '../client.js';
import { formatJson, formatPortalInfo, formatPortalInfoMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner } from '../formatters/index.js';

export const whoamiCommand = new Command('whoami')
  .description('Show current HubSpot portal info')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = createSpinner('Fetching portal info...', options);

    try {
      const info = await getPortalInfo();
      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(info));
          break;
        case 'markdown':
          console.log(formatPortalInfoMarkdown(info));
          break;
        default:
          console.log(formatPortalInfo(info));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch portal info');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
