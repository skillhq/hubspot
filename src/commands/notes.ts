import { Command } from 'commander';
import { getNotes, createNote } from '../client.js';
import { formatJson, formatNotes, formatNotesMarkdown, getOutputFormat, createSpinner, stopSpinner, failSpinner, succeedSpinner } from '../formatters/index.js';

export const notesCommand = new Command('notes')
  .description('List notes for an object')
  .argument('<objectType>', 'Object type (contacts, companies, deals, tickets)')
  .argument('<id>', 'Object ID')
  .option('-n, --limit <number>', 'Maximum number of notes', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (objectType, id, options) => {
    const spinner = createSpinner('Fetching notes...', options);

    try {
      const result = await getNotes(objectType, id, {
        limit: parseInt(options.limit),
      });

      stopSpinner(spinner);

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatNotesMarkdown(result.results));
          break;
        default:
          console.log(formatNotes(result.results));
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to fetch notes');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const noteCreateCommand = new Command('note-create')
  .description('Create a note for an object')
  .argument('<objectType>', 'Object type (contacts, companies, deals, tickets)')
  .argument('<id>', 'Object ID')
  .argument('<body>', 'Note body')
  .option('--json', 'Output as JSON')
  .action(async (objectType, id, body, options) => {
    const spinner = createSpinner('Creating note...', options);

    try {
      const note = await createNote(objectType, id, body);

      succeedSpinner(spinner, 'Note created!');

      if (options.json) {
        console.log(formatJson(note));
      } else {
        console.log(`Note ID: ${note.id}`);
      }
    } catch (error) {
      failSpinner(spinner, 'Failed to create note');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
