import chalk from 'chalk';
import type { Contact, Company, Deal, Ticket, Note, Task, Association, Pipeline, PortalInfo } from '../types.js';

export function formatPortalInfo(info: PortalInfo): string {
  const lines: string[] = [];
  lines.push(chalk.bold.blue('HubSpot Portal'));
  lines.push(`  Portal ID: ${chalk.cyan(info.portalId)}`);
  lines.push(`  Timezone:  ${info.timeZone}`);
  lines.push(`  Currency:  ${info.currency}`);
  if (info.domain) {
    lines.push(`  Domain:    ${info.domain}`);
  }
  if (info.companyName) {
    lines.push(`  Company:   ${info.companyName}`);
  }
  return lines.join('\n');
}

export function formatContacts(contacts: Contact[]): string {
  if (contacts.length === 0) {
    return chalk.gray('No contacts found');
  }

  const lines: string[] = [];
  for (const contact of contacts) {
    const name = [contact.firstname, contact.lastname].filter(Boolean).join(' ') || chalk.gray('(no name)');
    const email = contact.email ? chalk.cyan(contact.email) : '';
    const company = contact.company ? chalk.gray(` @ ${contact.company}`) : '';

    lines.push(`${chalk.bold(name)} ${email}${company}`);
    if (contact.jobtitle) {
      lines.push(chalk.gray(`  ${contact.jobtitle}`));
    }
    lines.push(chalk.gray(`  ID: ${contact.id}`));
  }
  return lines.join('\n');
}

export function formatContact(contact: Contact): string {
  const lines: string[] = [];
  const name = [contact.firstname, contact.lastname].filter(Boolean).join(' ') || 'Unknown';

  lines.push(chalk.bold.blue(name));
  if (contact.email) lines.push(`  Email:     ${chalk.cyan(contact.email)}`);
  if (contact.phone) lines.push(`  Phone:     ${contact.phone}`);
  if (contact.company) lines.push(`  Company:   ${contact.company}`);
  if (contact.jobtitle) lines.push(`  Job Title: ${contact.jobtitle}`);
  if (contact.lifecyclestage) lines.push(`  Stage:     ${formatLifecycleStage(contact.lifecyclestage)}`);
  if (contact.hs_lead_status) lines.push(`  Status:    ${contact.hs_lead_status}`);
  if (contact.createdate) lines.push(`  Created:   ${formatDate(contact.createdate)}`);
  lines.push(chalk.gray(`  ID: ${contact.id}`));

  return lines.join('\n');
}

export function formatCompanies(companies: Company[]): string {
  if (companies.length === 0) {
    return chalk.gray('No companies found');
  }

  const lines: string[] = [];
  for (const company of companies) {
    const name = company.name || chalk.gray('(no name)');
    const domain = company.domain ? chalk.cyan(company.domain) : '';
    const industry = company.industry ? chalk.gray(` (${company.industry})`) : '';

    lines.push(`${chalk.bold(name)} ${domain}${industry}`);
    if (company.city || company.state || company.country) {
      const location = [company.city, company.state, company.country].filter(Boolean).join(', ');
      lines.push(chalk.gray(`  ${location}`));
    }
    lines.push(chalk.gray(`  ID: ${company.id}`));
  }
  return lines.join('\n');
}

export function formatCompany(company: Company): string {
  const lines: string[] = [];
  const name = company.name || 'Unknown';

  lines.push(chalk.bold.blue(name));
  if (company.domain) lines.push(`  Domain:    ${chalk.cyan(company.domain)}`);
  if (company.industry) lines.push(`  Industry:  ${company.industry}`);
  if (company.phone) lines.push(`  Phone:     ${company.phone}`);
  if (company.city || company.state || company.country) {
    const location = [company.city, company.state, company.country].filter(Boolean).join(', ');
    lines.push(`  Location:  ${location}`);
  }
  if (company.numberofemployees) lines.push(`  Employees: ${company.numberofemployees}`);
  if (company.annualrevenue) lines.push(`  Revenue:   ${formatCurrency(company.annualrevenue)}`);
  if (company.description) lines.push(`  About:     ${company.description.substring(0, 100)}...`);
  if (company.createdate) lines.push(`  Created:   ${formatDate(company.createdate)}`);
  lines.push(chalk.gray(`  ID: ${company.id}`));

  return lines.join('\n');
}

export function formatDeals(deals: Deal[]): string {
  if (deals.length === 0) {
    return chalk.gray('No deals found');
  }

  const lines: string[] = [];
  for (const deal of deals) {
    const name = deal.dealname || chalk.gray('(no name)');
    const amount = deal.amount ? chalk.green(formatCurrency(deal.amount)) : '';
    const stage = deal.dealstage ? chalk.yellow(`[${deal.dealstage}]`) : '';

    lines.push(`${chalk.bold(name)} ${amount} ${stage}`);
    if (deal.closedate) {
      lines.push(chalk.gray(`  Close: ${formatDate(deal.closedate)}`));
    }
    lines.push(chalk.gray(`  ID: ${deal.id}`));
  }
  return lines.join('\n');
}

export function formatDeal(deal: Deal): string {
  const lines: string[] = [];
  const name = deal.dealname || 'Unknown';

  lines.push(chalk.bold.blue(name));
  if (deal.amount) lines.push(`  Amount:      ${chalk.green(formatCurrency(deal.amount))}`);
  if (deal.dealstage) lines.push(`  Stage:       ${chalk.yellow(deal.dealstage)}`);
  if (deal.pipeline) lines.push(`  Pipeline:    ${deal.pipeline}`);
  if (deal.closedate) lines.push(`  Close Date:  ${formatDate(deal.closedate)}`);
  if (deal.hs_deal_stage_probability) lines.push(`  Probability: ${deal.hs_deal_stage_probability}%`);
  if (deal.dealtype) lines.push(`  Type:        ${deal.dealtype}`);
  if (deal.description) lines.push(`  Description: ${deal.description.substring(0, 100)}...`);
  if (deal.createdate) lines.push(`  Created:     ${formatDate(deal.createdate)}`);
  lines.push(chalk.gray(`  ID: ${deal.id}`));

  return lines.join('\n');
}

export function formatTickets(tickets: Ticket[]): string {
  if (tickets.length === 0) {
    return chalk.gray('No tickets found');
  }

  const lines: string[] = [];
  for (const ticket of tickets) {
    const subject = ticket.subject || chalk.gray('(no subject)');
    const priority = ticket.hs_ticket_priority ? getPriorityIcon(ticket.hs_ticket_priority) : '';
    const stage = ticket.hs_pipeline_stage ? chalk.yellow(`[${ticket.hs_pipeline_stage}]`) : '';

    lines.push(`${priority}${chalk.bold(subject)} ${stage}`);
    if (ticket.content) {
      const preview = ticket.content.substring(0, 60).replace(/\n/g, ' ');
      lines.push(chalk.gray(`  ${preview}${ticket.content.length > 60 ? '...' : ''}`));
    }
    lines.push(chalk.gray(`  ID: ${ticket.id}`));
  }
  return lines.join('\n');
}

export function formatTicket(ticket: Ticket): string {
  const lines: string[] = [];
  const subject = ticket.subject || 'Unknown';

  lines.push(chalk.bold.blue(subject));
  if (ticket.hs_ticket_priority) lines.push(`  Priority: ${getPriorityIcon(ticket.hs_ticket_priority)} ${ticket.hs_ticket_priority}`);
  if (ticket.hs_pipeline_stage) lines.push(`  Stage:    ${chalk.yellow(ticket.hs_pipeline_stage)}`);
  if (ticket.hs_ticket_category) lines.push(`  Category: ${ticket.hs_ticket_category}`);
  if (ticket.content) lines.push(`  Content:  ${ticket.content}`);
  if (ticket.createdate) lines.push(`  Created:  ${formatDate(ticket.createdate)}`);
  lines.push(chalk.gray(`  ID: ${ticket.id}`));

  return lines.join('\n');
}

export function formatNotes(notes: Note[]): string {
  if (notes.length === 0) {
    return chalk.gray('No notes found');
  }

  const lines: string[] = [];
  for (const note of notes) {
    const date = note.hs_timestamp ? formatDate(note.hs_timestamp) : 'Unknown date';
    lines.push(chalk.gray(`--- ${date} ---`));
    lines.push(note.hs_note_body || chalk.gray('(empty note)'));
    lines.push(chalk.gray(`ID: ${note.id}`));
    lines.push('');
  }
  return lines.join('\n');
}

export function formatTasks(tasks: Task[]): string {
  if (tasks.length === 0) {
    return chalk.gray('No tasks found');
  }

  const lines: string[] = [];
  for (const task of tasks) {
    const subject = task.hs_task_subject || chalk.gray('(no subject)');
    const status = task.hs_task_status ? getStatusIcon(task.hs_task_status) : '';
    const priority = task.hs_task_priority ? getPriorityIcon(task.hs_task_priority) : '';

    lines.push(`${status}${priority}${chalk.bold(subject)}`);
    if (task.hs_timestamp) {
      lines.push(chalk.gray(`  Due: ${formatDate(task.hs_timestamp)}`));
    }
    lines.push(chalk.gray(`  ID: ${task.id}`));
  }
  return lines.join('\n');
}

export function formatTask(task: Task): string {
  const lines: string[] = [];
  const subject = task.hs_task_subject || 'Unknown';

  lines.push(chalk.bold.blue(subject));
  if (task.hs_task_status) lines.push(`  Status:   ${getStatusIcon(task.hs_task_status)} ${task.hs_task_status}`);
  if (task.hs_task_priority) lines.push(`  Priority: ${getPriorityIcon(task.hs_task_priority)} ${task.hs_task_priority}`);
  if (task.hs_task_type) lines.push(`  Type:     ${task.hs_task_type}`);
  if (task.hs_timestamp) lines.push(`  Due:      ${formatDate(task.hs_timestamp)}`);
  if (task.hs_task_body) lines.push(`  Body:     ${task.hs_task_body}`);
  lines.push(chalk.gray(`  ID: ${task.id}`));

  return lines.join('\n');
}

export function formatAssociations(associations: Association[]): string {
  if (associations.length === 0) {
    return chalk.gray('No associations found');
  }

  const lines: string[] = [];
  for (const assoc of associations) {
    const label = assoc.associationTypes[0]?.label || 'Associated';
    lines.push(`${chalk.cyan(assoc.toObjectType)} ${chalk.bold(assoc.toObjectId)} ${chalk.gray(`(${label})`)}`);
  }
  return lines.join('\n');
}

export function formatPipelines(pipelines: Pipeline[]): string {
  const lines: string[] = [];

  for (const pipeline of pipelines) {
    lines.push(chalk.bold.blue(pipeline.label));
    for (const stage of pipeline.stages.sort((a, b) => a.displayOrder - b.displayOrder)) {
      const probability = stage.metadata.probability ? chalk.gray(` (${stage.metadata.probability}%)`) : '';
      lines.push(`  ${chalk.yellow('>')} ${stage.label}${probability}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Helper functions
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatLifecycleStage(stage: string): string {
  const colors: Record<string, (s: string) => string> = {
    subscriber: chalk.gray,
    lead: chalk.blue,
    marketingqualifiedlead: chalk.cyan,
    salesqualifiedlead: chalk.yellow,
    opportunity: chalk.magenta,
    customer: chalk.green,
    evangelist: chalk.green,
  };
  const colorFn = colors[stage.toLowerCase()] || chalk.white;
  return colorFn(stage);
}

function getPriorityIcon(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return chalk.red('! ');
    case 'MEDIUM':
      return chalk.yellow('- ');
    case 'LOW':
      return chalk.gray('_ ');
    default:
      return '';
  }
}

function getStatusIcon(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return chalk.green('[x] ');
    case 'IN_PROGRESS':
      return chalk.yellow('[~] ');
    case 'NOT_STARTED':
      return chalk.gray('[ ] ');
    default:
      return '';
  }
}
