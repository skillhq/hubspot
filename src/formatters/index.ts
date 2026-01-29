import ora, { type Ora } from 'ora';

export * from './json.js';
export * from './plain.js';
export * from './markdown.js';

export type OutputFormat = 'plain' | 'json' | 'markdown';

export function getOutputFormat(options: { json?: boolean; markdown?: boolean; plain?: boolean }): OutputFormat {
  if (options.json) return 'json';
  if (options.markdown) return 'markdown';
  return 'plain';
}

// Spinner that only runs for non-JSON output (prevents stdout corruption when piping)
export function createSpinner(text: string, options: { json?: boolean }): Ora | null {
  if (options.json) return null;
  return ora(text).start();
}

export function stopSpinner(spinner: Ora | null): void {
  spinner?.stop();
}

export function failSpinner(spinner: Ora | null, text: string): void {
  spinner?.fail(text);
}

export function succeedSpinner(spinner: Ora | null, text: string): void {
  spinner?.succeed(text);
}
