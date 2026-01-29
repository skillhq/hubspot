import { Command } from 'commander';
import { getDeals, getDeal, searchDeals, filterDeals, getPipelines } from '../client.js';
import { formatJson, formatDeals, formatDeal, formatDealsMarkdown, formatDealMarkdown, formatPipelines, formatPipelinesMarkdown, getOutputFormat } from '../formatters/index.js';
import ora from 'ora';

export const dealsCommand = new Command('deals')
  .description('List deals')
  .option('-n, --limit <number>', 'Maximum number of deals', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--pipeline <id>', 'Filter by pipeline ID')
  .option('--stage <id>', 'Filter by stage ID')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = ora('Fetching deals...').start();

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());

      // Use filterDeals if pipeline or stage filter is specified
      const result = (options.pipeline || options.stage)
        ? await filterDeals({
            limit: parseInt(options.limit),
            after: options.after,
            properties,
            pipeline: options.pipeline,
            stage: options.stage,
          })
        : await getDeals({
            limit: parseInt(options.limit),
            after: options.after,
            properties,
          });

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatDealsMarkdown(result.results));
          break;
        default:
          console.log(formatDeals(result.results));
      }

      if (result.paging?.next?.after) {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      spinner.fail('Failed to fetch deals');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const dealCommand = new Command('deal')
  .description('Get deal by ID')
  .argument('<id>', 'Deal ID')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const spinner = ora('Fetching deal...').start();

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const deal = await getDeal(id, properties);

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(deal));
          break;
        case 'markdown':
          console.log(formatDealMarkdown(deal));
          break;
        default:
          console.log(formatDeal(deal));
      }
    } catch (error) {
      spinner.fail('Failed to fetch deal');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const dealSearchCommand = new Command('deal-search')
  .description('Search deals')
  .argument('<query>', 'Search query')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (query, options) => {
    const spinner = ora('Searching deals...').start();

    try {
      const result = await searchDeals(query, {
        limit: parseInt(options.limit),
      });

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatDealsMarkdown(result.results));
          break;
        default:
          console.log(formatDeals(result.results));
      }
    } catch (error) {
      spinner.fail('Failed to search deals');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const pipelinesCommand = new Command('pipelines')
  .description('List deal pipelines and stages')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = ora('Fetching pipelines...').start();

    try {
      const pipelines = await getPipelines();

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(pipelines));
          break;
        case 'markdown':
          console.log(formatPipelinesMarkdown(pipelines));
          break;
        default:
          console.log(formatPipelines(pipelines));
      }
    } catch (error) {
      spinner.fail('Failed to fetch pipelines');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
