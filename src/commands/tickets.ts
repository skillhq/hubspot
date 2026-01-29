import { Command } from 'commander';
import { getTickets, getTicket, searchTickets } from '../client.js';
import { formatJson, formatTickets, formatTicket, formatTicketsMarkdown, formatTicketMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner } from '../formatters/index.js';

export const ticketsCommand = new Command('tickets')
  .description('List tickets')
  .option('-n, --limit <number>', 'Maximum number of tickets', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = createSpinner('Fetching tickets...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const result = await getTickets({
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
          console.log(formatTicketsMarkdown(result.results));
          break;
        default:
          console.log(formatTickets(result.results));
      }

      // Only show pagination hint for non-JSON output (JSON includes paging in response)
      if (result.paging?.next?.after && format !== 'json') {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch tickets');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const ticketCommand = new Command('ticket')
  .description('Get ticket by ID')
  .argument('<id>', 'Ticket ID')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const spinner = createSpinner('Fetching ticket...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const ticket = await getTicket(id, properties);

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(ticket));
          break;
        case 'markdown':
          console.log(formatTicketMarkdown(ticket));
          break;
        default:
          console.log(formatTicket(ticket));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch ticket');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const ticketSearchCommand = new Command('ticket-search')
  .description('Search tickets')
  .argument('<query>', 'Search query')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (query, options) => {
    const spinner = createSpinner('Searching tickets...', options);

    try {
      const result = await searchTickets(query, {
        limit: parseInt(options.limit),
      });

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatTicketsMarkdown(result.results));
          break;
        default:
          console.log(formatTickets(result.results));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to search tickets');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
