import { Command } from 'commander';
import { getTasks, getTask, createTask } from '../client.js';
import { formatJson, formatTasks, formatTask, formatTasksMarkdown, formatTaskMarkdown, getOutputFormat } from '../formatters/index.js';
import ora from 'ora';

export const tasksCommand = new Command('tasks')
  .description('List tasks')
  .option('-n, --limit <number>', 'Maximum number of tasks', '20')
  .option('--after <cursor>', 'Pagination cursor')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    const spinner = ora('Fetching tasks...').start();

    try {
      const result = await getTasks({
        limit: parseInt(options.limit),
        after: options.after,
      });

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(result));
          break;
        case 'markdown':
          console.log(formatTasksMarkdown(result.results));
          break;
        default:
          console.log(formatTasks(result.results));
      }

      if (result.paging?.next?.after) {
        console.log(`\nNext page: --after ${result.paging.next.after}`);
      }
    } catch (error) {
      spinner.fail('Failed to fetch tasks');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const taskCommand = new Command('task')
  .description('Get task by ID')
  .argument('<id>', 'Task ID')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (id, options) => {
    const spinner = ora('Fetching task...').start();

    try {
      const task = await getTask(id);

      spinner.stop();

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(task));
          break;
        case 'markdown':
          console.log(formatTaskMarkdown(task));
          break;
        default:
          console.log(formatTask(task));
      }
    } catch (error) {
      spinner.fail('Failed to fetch task');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const taskCreateCommand = new Command('task-create')
  .description('Create a new task')
  .option('--subject <subject>', 'Task subject (required)')
  .option('--body <body>', 'Task body')
  .option('--due <date>', 'Due date (ISO format)')
  .option('--priority <priority>', 'Priority (LOW, MEDIUM, HIGH)')
  .option('--status <status>', 'Status (NOT_STARTED, IN_PROGRESS, COMPLETED)')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (options) => {
    if (!options.subject) {
      console.error('--subject is required');
      process.exit(1);
    }

    const spinner = ora('Creating task...').start();

    try {
      const task = await createTask({
        subject: options.subject,
        body: options.body,
        dueDate: options.due,
        priority: options.priority?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | undefined,
        status: options.status?.toUpperCase() as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | undefined,
      });

      spinner.succeed('Task created!');

      const format = getOutputFormat(options);

      switch (format) {
        case 'json':
          console.log(formatJson(task));
          break;
        case 'markdown':
          console.log(formatTaskMarkdown(task));
          break;
        default:
          console.log(formatTask(task));
      }
    } catch (error) {
      spinner.fail('Failed to create task');
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
