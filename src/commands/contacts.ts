import { Command } from 'commander';
import { getContacts, getContact, searchContacts, createContact, updateContact } from '../client.js';
import { formatJson, formatContacts, formatContact, formatContactsMarkdown, formatContactMarkdown, getOutputFormat } from '../formatters/index.js';
import ora from 'ora';

export const contactsCommand = new Command('contacts')
  .description('List contacts')
  .option('-n, --limit <number>', 'Maximum number of contacts', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--properties <props>', 'Comma-separated properties to fetch')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = ora('Fetching contacts...').start();

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const result = await getContacts({
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
          console.log(formatContactsMarkdown(result.results));
          break;
        default:
          console.log(formatContacts(result.results));
      }

      if (result.paging?.next?.after) {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      spinner.fail('Failed to fetch contacts');
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
    const spinner = ora('Fetching contact...').start();

    try {
      const properties = options.properties?.split(',').map((p: string) => p.trim());
      const contact = await getContact(id, properties);

      spinner.stop();

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
      spinner.fail('Failed to fetch contact');
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
    const spinner = ora('Searching contacts...').start();

    try {
      const result = await searchContacts(query, {
        limit: parseInt(options.limit),
      });

      spinner.stop();

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
      spinner.fail('Failed to search contacts');
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

    const spinner = ora('Creating contact...').start();

    try {
      const contact = await createContact(properties);

      spinner.succeed('Contact created!');

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
      spinner.fail('Failed to create contact');
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

    const spinner = ora('Updating contact...').start();

    try {
      const contact = await updateContact(id, properties);

      spinner.succeed('Contact updated!');

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
      spinner.fail('Failed to update contact');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
