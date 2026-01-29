import { Command } from 'commander';
import { getContacts, getContact, searchContacts, createContact, updateContact } from '../client.js';
import { formatJson, formatContacts, formatContact, formatContactsMarkdown, formatContactMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner, succeedSpinner } from '../formatters/index.js';

export const contactsCommand = new Command('contacts')
  .description('List contacts')
  .option('-n, --limit <number>', 'Maximum number of contacts', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = createSpinner('Fetching contacts...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const result = await getContacts({
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
          console.log(formatContactsMarkdown(result.results));
          break;
        default:
          console.log(formatContacts(result.results));
      }

      // Only show pagination hint for non-JSON output (JSON includes paging in response)
      if (result.paging?.next?.after && format !== 'json') {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch contacts');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const contactCommand = new Command('contact')
  .description('Get contact by ID')
  .argument('<id>', 'Contact ID')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const spinner = createSpinner('Fetching contact...', options);

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const contact = await getContact(id, properties);

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(contact));
          break;
        case 'markdown':
          console.log(formatContactMarkdown(contact));
          break;
        default:
          console.log(formatContact(contact));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch contact');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const contactSearchCommand = new Command('contact-search')
  .description('Search contacts')
  .argument('<query>', 'Search query')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (query, options) => {
    const spinner = createSpinner('Searching contacts...', options);

    try {
      const result = await searchContacts(query, {
        limit: parseInt(options.limit),
      });

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatContactsMarkdown(result.results));
          break;
        default:
          console.log(formatContacts(result.results));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to search contacts');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const contactCreateCommand = new Command('contact-create')
  .description('Create a new contact')
  .option('--email <email>', 'Email address')
  .option('--firstname <name>', 'First name')
  .option('--lastname <name>', 'Last name')
  .option('--phone <phone>', 'Phone number')
  .option('--company <company>', 'Company name')
  .option('--jobtitle <title>', 'Job title')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const properties: Record<string, string> = {};

    if (options.email) properties.email = options.email;
    if (options.firstname) properties.firstname = options.firstname;
    if (options.lastname) properties.lastname = options.lastname;
    if (options.phone) properties.phone = options.phone;
    if (options.company) properties.company = options.company;
    if (options.jobtitle) properties.jobtitle = options.jobtitle;

    if (Object.keys(properties).length === 0) {
      console.error('At least one property is required (--email, --firstname, etc.)');
      process.exit(1);
    }

    const spinner = createSpinner('Creating contact...', options);

    try {
      const contact = await createContact(properties);

      succeedSpinner(spinner, 'Contact created!');

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(contact));
          break;
        case 'markdown':
          console.log(formatContactMarkdown(contact));
          break;
        default:
          console.log(formatContact(contact));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to create contact');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const contactUpdateCommand = new Command('contact-update')
  .description('Update a contact')
  .argument('<id>', 'Contact ID')
  .option('--email <email>', 'Email address')
  .option('--firstname <name>', 'First name')
  .option('--lastname <name>', 'Last name')
  .option('--phone <phone>', 'Phone number')
  .option('--company <company>', 'Company name')
  .option('--jobtitle <title>', 'Job title')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const properties: Record<string, string> = {};

    if (options.email) properties.email = options.email;
    if (options.firstname) properties.firstname = options.firstname;
    if (options.lastname) properties.lastname = options.lastname;
    if (options.phone) properties.phone = options.phone;
    if (options.company) properties.company = options.company;
    if (options.jobtitle) properties.jobtitle = options.jobtitle;

    if (Object.keys(properties).length === 0) {
      console.error('At least one property to update is required');
      process.exit(1);
    }

    const spinner = createSpinner('Updating contact...', options);

    try {
      const contact = await updateContact(id, properties);

      succeedSpinner(spinner, 'Contact updated!');

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(contact));
          break;
        case 'markdown':
          console.log(formatContactMarkdown(contact));
          break;
        default:
          console.log(formatContact(contact));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to update contact');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
