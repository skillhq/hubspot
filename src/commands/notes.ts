import { Command } from 'commander';
import { getNotes, createNote } from '../client.js';
import { formatJson, formatNotes, formatNotesMarkdown, getOutputFormat } from '../formatters/index.js';
import ora from 'ora';

export const notesCommand = new Command('notes')
  .description('List notes for an object')
  .argument('<objectType>', 'Object type (contacts, companies, deals, tickets)')
  .argument('<id>', 'Object ID')
  .option('-n, --limit <number>', 'Maximum number of notes', '20')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (objectType, id, options) => {
    const spinner = ora('Fetching notes...').start();

    try {
      const result = await getNotes(objectType, id, {
        limit: parseInt(options.limit),
      });

      spinner.stop();

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
      spinner.fail('Failed to fetch notes');
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
    const spinner = ora('Creating note...').start();

    try {
      const note = await createNote(objectType, id, body);

      spinner.succeed('Note created!');

      if (options.json) {
        console.log(formatJson(note));
      } else {
        console.log(`Note ID: ${note.id}`);
      }
    } catch (error) {
      spinner.fail('Failed to create note');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
