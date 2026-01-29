import type { Contact, Company, Deal, Ticket, Note, Task, Association, Pipeline, PortalInfo } from '../types.js';

export function formatPortalInfoMarkdown(info: PortalInfo): string {
  const lines: string[] = ['# HubSpot Portal\n'];
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Portal ID | ${info.portalId} |`);
  lines.push(`| Timezone | ${info.timeZone} |`);
  lines.push(`| Currency | ${info.currency} |`);
  if (info.domain) lines.push(`| Domain | ${info.domain} |`);
  if (info.companyName) lines.push(`| Company | ${info.companyName} |`);
  return lines.join('\n');
}

export function formatContactsMarkdown(contacts: Contact[]): string {
  if (contacts.length === 0) {
    return 'No contacts found';
  }

  const lines: string[] = ['# Contacts\n'];
  lines.push('| Name | Email | Company | Job Title | ID |');
  lines.push('|------|-------|---------|-----------|-------|');

  for (const contact of contacts) {
    const name = [contact.firstname, contact.lastname].filter(Boolean).join(' ') || '-';
    const email = contact.email || '-';
    const company = contact.company || '-';
    const jobtitle = contact.jobtitle || '-';
    lines.push(`| ${name} | ${email} | ${company} | ${jobtitle} | ${contact.id} |`);
  }

  return lines.join('\n');
}

export function formatContactMarkdown(contact: Contact): string {
  const lines: string[] = [];
  const name = [contact.firstname, contact.lastname].filter(Boolean).join(' ') || 'Unknown';

  lines.push(`# ${name}\n`);
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| ID | ${contact.id} |`);
  if (contact.email) lines.push(`| Email | ${contact.email} |`);
  if (contact.phone) lines.push(`| Phone | ${contact.phone} |`);
  if (contact.company) lines.push(`| Company | ${contact.company} |`);
  if (contact.jobtitle) lines.push(`| Job Title | ${contact.jobtitle} |`);
  if (contact.lifecyclestage) lines.push(`| Lifecycle Stage | ${contact.lifecyclestage} |`);
  if (contact.hs_lead_status) lines.push(`| Lead Status | ${contact.hs_lead_status} |`);
  if (contact.createdate) lines.push(`| Created | ${contact.createdate} |`);

  return lines.join('\n');
}

export function formatCompaniesMarkdown(companies: Company[]): string {
  if (companies.length === 0) {
    return 'No companies found';
  }

  const lines: string[] = ['# Companies\n'];
  lines.push('| Name | Domain | Industry | Location | ID |');
  lines.push('|------|--------|----------|----------|-------|');

  for (const company of companies) {
    const name = company.name || '-';
    const domain = company.domain || '-';
    const industry = company.industry || '-';
    const location = [company.city, company.state, company.country].filter(Boolean).join(', ') || '-';
    lines.push(`| ${name} | ${domain} | ${industry} | ${location} | ${company.id} |`);
  }

  return lines.join('\n');
}

export function formatCompanyMarkdown(company: Company): string {
  const lines: string[] = [];
  const name = company.name || 'Unknown';

  lines.push(`# ${name}\n`);
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| ID | ${company.id} |`);
  if (company.domain) lines.push(`| Domain | ${company.domain} |`);
  if (company.industry) lines.push(`| Industry | ${company.industry} |`);
  if (company.phone) lines.push(`| Phone | ${company.phone} |`);
  if (company.city || company.state || company.country) {
    const location = [company.city, company.state, company.country].filter(Boolean).join(', ');
    lines.push(`| Location | ${location} |`);
  }
  if (company.numberofemployees) lines.push(`| Employees | ${company.numberofemployees} |`);
  if (company.annualrevenue) lines.push(`| Annual Revenue | ${company.annualrevenue} |`);
  if (company.createdate) lines.push(`| Created | ${company.createdate} |`);

  if (company.description) {
    lines.push(`\n## Description\n${company.description}`);
  }

  return lines.join('\n');
}

export function formatDealsMarkdown(deals: Deal[]): string {
  if (deals.length === 0) {
    return 'No deals found';
  }

  const lines: string[] = ['# Deals\n'];
  lines.push('| Deal Name | Amount | Stage | Close Date | ID |');
  lines.push('|-----------|--------|-------|------------|-------|');

  for (const deal of deals) {
    const name = deal.dealname || '-';
    const amount = deal.amount ? `$${deal.amount}` : '-';
    const stage = deal.dealstage || '-';
    const closedate = deal.closedate || '-';
    lines.push(`| ${name} | ${amount} | ${stage} | ${closedate} | ${deal.id} |`);
  }

  return lines.join('\n');
}

export function formatDealMarkdown(deal: Deal): string {
  const lines: string[] = [];
  const name = deal.dealname || 'Unknown';

  lines.push(`# ${name}\n`);
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| ID | ${deal.id} |`);
  if (deal.amount) lines.push(`| Amount | $${deal.amount} |`);
  if (deal.dealstage) lines.push(`| Stage | ${deal.dealstage} |`);
  if (deal.pipeline) lines.push(`| Pipeline | ${deal.pipeline} |`);
  if (deal.closedate) lines.push(`| Close Date | ${deal.closedate} |`);
  if (deal.hs_deal_stage_probability) lines.push(`| Probability | ${deal.hs_deal_stage_probability}% |`);
  if (deal.dealtype) lines.push(`| Type | ${deal.dealtype} |`);
  if (deal.createdate) lines.push(`| Created | ${deal.createdate} |`);

  if (deal.description) {
    lines.push(`\n## Description\n${deal.description}`);
  }

  return lines.join('\n');
}

export function formatTicketsMarkdown(tickets: Ticket[]): string {
  if (tickets.length === 0) {
    return 'No tickets found';
  }

  const lines: string[] = ['# Tickets\n'];
  lines.push('| Subject | Priority | Stage | Created | ID |');
  lines.push('|---------|----------|-------|---------|-------|');

  for (const ticket of tickets) {
    const subject = ticket.subject || '-';
    const priority = ticket.hs_ticket_priority || '-';
    const stage = ticket.hs_pipeline_stage || '-';
    const createdate = ticket.createdate || '-';
    lines.push(`| ${subject} | ${priority} | ${stage} | ${createdate} | ${ticket.id} |`);
  }

  return lines.join('\n');
}

export function formatTicketMarkdown(ticket: Ticket): string {
  const lines: string[] = [];
  const subject = ticket.subject || 'Unknown';

  lines.push(`# ${subject}\n`);
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| ID | ${ticket.id} |`);
  if (ticket.hs_ticket_priority) lines.push(`| Priority | ${ticket.hs_ticket_priority} |`);
  if (ticket.hs_pipeline_stage) lines.push(`| Stage | ${ticket.hs_pipeline_stage} |`);
  if (ticket.hs_ticket_category) lines.push(`| Category | ${ticket.hs_ticket_category} |`);
  if (ticket.createdate) lines.push(`| Created | ${ticket.createdate} |`);

  if (ticket.content) {
    lines.push(`\n## Content\n${ticket.content}`);
  }

  return lines.join('\n');
}

export function formatNotesMarkdown(notes: Note[]): string {
  if (notes.length === 0) {
    return 'No notes found';
  }

  const lines: string[] = ['# Notes\n'];

  for (const note of notes) {
    const date = note.hs_timestamp || 'Unknown date';
    lines.push(`## Note ${note.id} - ${date}\n`);
    lines.push(note.hs_note_body || '*(empty)*');
    lines.push('');
  }

  return lines.join('\n');
}

export function formatTasksMarkdown(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found';
  }

  const lines: string[] = ['# Tasks\n'];
  lines.push('| Subject | Status | Priority | Due Date | ID |');
  lines.push('|---------|--------|----------|----------|-------|');

  for (const task of tasks) {
    const subject = task.hs_task_subject || '-';
    const status = task.hs_task_status || '-';
    const priority = task.hs_task_priority || '-';
    const dueDate = task.hs_timestamp || '-';
    lines.push(`| ${subject} | ${status} | ${priority} | ${dueDate} | ${task.id} |`);
  }

  return lines.join('\n');
}

export function formatTaskMarkdown(task: Task): string {
  const lines: string[] = [];
  const subject = task.hs_task_subject || 'Unknown';

  lines.push(`# ${subject}\n`);
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| ID | ${task.id} |`);
  if (task.hs_task_status) lines.push(`| Status | ${task.hs_task_status} |`);
  if (task.hs_task_priority) lines.push(`| Priority | ${task.hs_task_priority} |`);
  if (task.hs_task_type) lines.push(`| Type | ${task.hs_task_type} |`);
  if (task.hs_timestamp) lines.push(`| Due Date | ${task.hs_timestamp} |`);

  if (task.hs_task_body) {
    lines.push(`\n## Body\n${task.hs_task_body}`);
  }

  return lines.join('\n');
}

export function formatAssociationsMarkdown(associations: Association[]): string {
  if (associations.length === 0) {
    return 'No associations found';
  }

  const lines: string[] = ['# Associations\n'];
  lines.push('| Type | Object ID | Association |');
  lines.push('|------|-----------|-------------|');

  for (const assoc of associations) {
    const label = assoc.associationTypes[0]?.label || 'Associated';
    lines.push(`| ${assoc.toObjectType} | ${assoc.toObjectId} | ${label} |`);
  }

  return lines.join('\n');
}

export function formatPipelinesMarkdown(pipelines: Pipeline[]): string {
  const lines: string[] = ['# Deal Pipelines\n'];

  for (const pipeline of pipelines) {
    lines.push(`## ${pipeline.label}\n`);
    lines.push('| Stage | Order | Probability |');
    lines.push('|-------|-------|-------------|');

    for (const stage of pipeline.stages.sort((a, b) => a.displayOrder - b.displayOrder)) {
      const probability = stage.metadata.probability || '-';
      lines.push(`| ${stage.label} | ${stage.displayOrder} | ${probability}% |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
