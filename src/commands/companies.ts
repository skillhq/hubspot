import { Command } from 'commander';
import { getCompanies, getCompany, searchCompanies } from '../client.js';
import { formatJson, formatCompanies, formatCompany, formatCompaniesMarkdown, formatCompanyMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner } from '../formatters/index.js';

export const companiesCommand = new Command('companies')
  .description('List companies')
  .option('-n, --limit <number>', 'Maximum number of companies', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = createSpinner('Fetching companies...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const result = await getCompanies({
        limit: parseInt(options.limit),
        after: options.after,
        properties,
      });

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatCompaniesMarkdown(result.results));
          break;
        default:
          console.log(formatCompanies(result.results));
      }

      // Only show pagination hint for non-JSON output (JSON includes paging in response)
      if (result.paging?.next?.after && format !== 'json') {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch companies');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const companyCommand = new Command('company')
  .description('Get company by ID')
  .argument('<id>', 'Company ID')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const spinner = createSpinner('Fetching company...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const company = await getCompany(id, properties);

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(company));
          break;
        case 'markdown':
          console.log(formatCompanyMarkdown(company));
          break;
        default:
          console.log(formatCompany(company));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch company');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const companySearchCommand = new Command('company-search')
  .description('Search companies')
  .argument('<query>', 'Search query')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (query, options) => {
    const spinner = createSpinner('Searching companies...', options);

    try {
      const result = await searchCompanies(query, {
        limit: parseInt(options.limit),
      });

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatCompaniesMarkdown(result.results));
          break;
        default:
          console.log(formatCompanies(result.results));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to search companies');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
