import { Command } from 'commander';
import { getAssociations, createAssociation } from '../client.js';
import { formatJson, formatAssociations, formatAssociationsMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner, succeedSpinner } from '../formatters/index.js';

export const associationsCommand = new Command('associations')
  .description('List associations for an object')
  .argument('<fromType>', 'From object type (contacts, companies, deals, tickets)')
  .argument('<id>', 'Object ID')
  .argument('<toType>', 'To object type (contacts, companies, deals, tickets)')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (fromType, id, toType, options) => {
    const spinner = createSpinner('Fetching associations...', options);

    try {
      const associations = await getAssociations(fromType, id, toType);

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(associations));
          break;
        case 'markdown':
          console.log(formatAssociationsMarkdown(associations));
          break;
        default:
          console.log(formatAssociations(associations));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch associations');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const associateCommand = new Command('associate')
  .description('Create an association between two objects')
  .argument('<fromType>', 'From object type (contacts, companies, deals, tickets)')
  .argument('<fromId>', 'From object ID')
  .argument('<toType>', 'To object type (contacts, companies, deals, tickets)')
  .argument('<toId>', 'To object ID')
  .option('--json', 'Output as JSON')
  .action(async (fromType, fromId, toType, toId, options) => {
    const spinner = createSpinner('Creating association...', options);

    try {
      await createAssociation(fromType, fromId, toType, toId);

      succeedSpinner(spinner, 'Association created!');
      console.log(`${fromType}/${fromId} -> ${toType}/${toId}`);
    } catch (error) {
      failSpinner(spinner, 'Failed to create association');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
