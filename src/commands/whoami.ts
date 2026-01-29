import { Command } from 'commander';
import { getPortalInfo } from '../client.js';
import { formatJson, formatPortalInfo, formatPortalInfoMarkdown, getOutputFormat } from '../formatters/index.js';
import ora from 'ora';

export const whoamiCommand = new Command('whoami')
  .description('Show current HubSpot portal info')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = ora('Fetching portal info...').start();

    try {
      const info = await getPortalInfo();
      spinner.stop();

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
      spinner.fail('Failed to fetch portal info');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
