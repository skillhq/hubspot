import { Client } from '@hubspot/api-client';
import { AssociationSpecAssociationCategoryEnum } from '@hubspot/api-client/lib/codegen/crm/associations/v4/models/AssociationSpec.js';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/deals/models/Filter.js';
import { getAccessToken, isConfigured, setPortalId } from './config.js';
import type {
  Contact,
  Company,
  Deal,
  Ticket,
  Note,
  Task,
  Association,
  Pipeline,
  PortalInfo,
  Owner,
  PaginatedResult,
  SearchOptions,
} from './types.js';

let clientInstance: Client | null = null;

export function getClient(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  if (!isConfigured()) {
    throw new Error('Not configured. Run "hs auth" first to set up your access token.');
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Access token not found. Run "hs auth" to configure.');
  }

  clientInstance = new Client({ accessToken });
  return clientInstance;
}

// Portal Info
export async function getPortalInfo(): Promise<PortalInfo> {
  const client = getClient();
  const response = await client.apiRequest({
    method: 'GET',
    path: '/account-info/v3/details',
  });
  const data = await response.json() as {
    portalId: number;
    timeZone: string;
    utcOffsetMilliseconds: number;
    currency: string;
    additionalCurrencies: string[];
    companyCurrency: string;
  };

  // Save portal ID to config
  setPortalId(data.portalId.toString());

  return {
    portalId: data.portalId,
    timeZone: data.timeZone,
    currency: data.currency,
  };
}

// Contacts
export async function getContacts(options: { limit?: number; after?: string; properties?: string[] } = {}): Promise<PaginatedResult<Contact>> {
  const client = getClient();
  const { limit = 20, after, properties = ['email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle', 'lifecyclestage', 'createdate'] } = options;

  const response = await client.crm.contacts.basicApi.getPage(limit, after, properties);

  return {
    results: response.results.map(r => ({
      id: r.id,
      email: r.properties.email ?? undefined,
      firstname: r.properties.firstname ?? undefined,
      lastname: r.properties.lastname ?? undefined,
      phone: r.properties.phone ?? undefined,
      company: r.properties.company ?? undefined,
      jobtitle: r.properties.jobtitle ?? undefined,
      lifecyclestage: r.properties.lifecyclestage ?? undefined,
      createdate: r.properties.createdate ?? undefined,
      lastmodifieddate: r.properties.hs_lastmodifieddate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getContact(id: string, properties?: string[]): Promise<Contact> {
  const client = getClient();
  const defaultProps = ['email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle', 'lifecyclestage', 'hs_lead_status', 'createdate', 'hs_lastmodifieddate'];

  const response = await client.crm.contacts.basicApi.getById(id, properties ?? defaultProps);

  return {
    id: response.id,
    email: response.properties.email ?? undefined,
    firstname: response.properties.firstname ?? undefined,
    lastname: response.properties.lastname ?? undefined,
    phone: response.properties.phone ?? undefined,
    company: response.properties.company ?? undefined,
    jobtitle: response.properties.jobtitle ?? undefined,
    lifecyclestage: response.properties.lifecyclestage ?? undefined,
    hs_lead_status: response.properties.hs_lead_status ?? undefined,
    createdate: response.properties.createdate ?? undefined,
    lastmodifieddate: response.properties.hs_lastmodifieddate ?? undefined,
    properties: response.properties,
  };
}

export async function searchContacts(query: string, options: SearchOptions = {}): Promise<PaginatedResult<Contact>> {
  const client = getClient();
  const { limit = 20, after, properties = ['email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle'] } = options;

  const response = await client.crm.contacts.searchApi.doSearch({
    query,
    limit,
    after,
    properties,
  });

  return {
    results: response.results.map(r => ({
      id: r.id,
      email: r.properties.email ?? undefined,
      firstname: r.properties.firstname ?? undefined,
      lastname: r.properties.lastname ?? undefined,
      phone: r.properties.phone ?? undefined,
      company: r.properties.company ?? undefined,
      jobtitle: r.properties.jobtitle ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function createContact(properties: Record<string, string>): Promise<Contact> {
  const client = getClient();
  const response = await client.crm.contacts.basicApi.create({ properties });

  return {
    id: response.id,
    email: response.properties.email ?? undefined,
    firstname: response.properties.firstname ?? undefined,
    lastname: response.properties.lastname ?? undefined,
    properties: response.properties,
  };
}

export async function updateContact(id: string, properties: Record<string, string>): Promise<Contact> {
  const client = getClient();
  const response = await client.crm.contacts.basicApi.update(id, { properties });

  return {
    id: response.id,
    email: response.properties.email ?? undefined,
    firstname: response.properties.firstname ?? undefined,
    lastname: response.properties.lastname ?? undefined,
    properties: response.properties,
  };
}

// Companies
export async function getCompanies(options: { limit?: number; after?: string; properties?: string[] } = {}): Promise<PaginatedResult<Company>> {
  const client = getClient();
  const { limit = 20, after, properties = ['name', 'domain', 'industry', 'phone', 'city', 'state', 'country', 'numberofemployees', 'annualrevenue', 'createdate'] } = options;

  const response = await client.crm.companies.basicApi.getPage(limit, after, properties);

  return {
    results: response.results.map(r => ({
      id: r.id,
      name: r.properties.name ?? undefined,
      domain: r.properties.domain ?? undefined,
      industry: r.properties.industry ?? undefined,
      phone: r.properties.phone ?? undefined,
      city: r.properties.city ?? undefined,
      state: r.properties.state ?? undefined,
      country: r.properties.country ?? undefined,
      numberofemployees: r.properties.numberofemployees ?? undefined,
      annualrevenue: r.properties.annualrevenue ?? undefined,
      createdate: r.properties.createdate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getCompany(id: string, properties?: string[]): Promise<Company> {
  const client = getClient();
  const defaultProps = ['name', 'domain', 'industry', 'phone', 'city', 'state', 'country', 'numberofemployees', 'annualrevenue', 'description', 'createdate', 'hs_lastmodifieddate'];

  const response = await client.crm.companies.basicApi.getById(id, properties ?? defaultProps);

  return {
    id: response.id,
    name: response.properties.name ?? undefined,
    domain: response.properties.domain ?? undefined,
    industry: response.properties.industry ?? undefined,
    phone: response.properties.phone ?? undefined,
    city: response.properties.city ?? undefined,
    state: response.properties.state ?? undefined,
    country: response.properties.country ?? undefined,
    numberofemployees: response.properties.numberofemployees ?? undefined,
    annualrevenue: response.properties.annualrevenue ?? undefined,
    description: response.properties.description ?? undefined,
    createdate: response.properties.createdate ?? undefined,
    lastmodifieddate: response.properties.hs_lastmodifieddate ?? undefined,
    properties: response.properties,
  };
}

export async function searchCompanies(query: string, options: SearchOptions = {}): Promise<PaginatedResult<Company>> {
  const client = getClient();
  const { limit = 20, after, properties = ['name', 'domain', 'industry', 'city', 'state'] } = options;

  const response = await client.crm.companies.searchApi.doSearch({
    query,
    limit,
    after,
    properties,
  });

  return {
    results: response.results.map(r => ({
      id: r.id,
      name: r.properties.name ?? undefined,
      domain: r.properties.domain ?? undefined,
      industry: r.properties.industry ?? undefined,
      city: r.properties.city ?? undefined,
      state: r.properties.state ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

// Deals
export async function getDeals(options: { limit?: number; after?: string; properties?: string[] } = {}): Promise<PaginatedResult<Deal>> {
  const client = getClient();
  const { limit = 20, after, properties = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'createdate'] } = options;

  const response = await client.crm.deals.basicApi.getPage(limit, after, properties);

  return {
    results: response.results.map(r => ({
      id: r.id,
      dealname: r.properties.dealname ?? undefined,
      amount: r.properties.amount ?? undefined,
      dealstage: r.properties.dealstage ?? undefined,
      pipeline: r.properties.pipeline ?? undefined,
      closedate: r.properties.closedate ?? undefined,
      createdate: r.properties.createdate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getDeal(id: string, properties?: string[]): Promise<Deal> {
  const client = getClient();
  const defaultProps = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hs_deal_stage_probability', 'dealtype', 'description', 'createdate', 'hs_lastmodifieddate'];

  const response = await client.crm.deals.basicApi.getById(id, properties ?? defaultProps);

  return {
    id: response.id,
    dealname: response.properties.dealname ?? undefined,
    amount: response.properties.amount ?? undefined,
    dealstage: response.properties.dealstage ?? undefined,
    pipeline: response.properties.pipeline ?? undefined,
    closedate: response.properties.closedate ?? undefined,
    hs_deal_stage_probability: response.properties.hs_deal_stage_probability ?? undefined,
    dealtype: response.properties.dealtype ?? undefined,
    description: response.properties.description ?? undefined,
    createdate: response.properties.createdate ?? undefined,
    lastmodifieddate: response.properties.hs_lastmodifieddate ?? undefined,
    properties: response.properties,
  };
}

export async function searchDeals(query: string, options: SearchOptions = {}): Promise<PaginatedResult<Deal>> {
  const client = getClient();
  const { limit = 20, after, properties = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate'], filters } = options;

  // Build filter groups if filters are provided
  const filterGroups = filters?.length
    ? [{ filters: filters.map(f => ({ propertyName: f.propertyName, operator: f.operator as FilterOperatorEnum, value: f.value })) }]
    : undefined;

  const response = await client.crm.deals.searchApi.doSearch({
    query,
    limit,
    after,
    properties,
    filterGroups,
  });

  return {
    results: response.results.map(r => ({
      id: r.id,
      dealname: r.properties.dealname ?? undefined,
      amount: r.properties.amount ?? undefined,
      dealstage: r.properties.dealstage ?? undefined,
      pipeline: r.properties.pipeline ?? undefined,
      closedate: r.properties.closedate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function filterDeals(options: SearchOptions & { pipeline?: string; stage?: string } = {}): Promise<PaginatedResult<Deal>> {
  const client = getClient();
  const { limit = 20, after, properties = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate'], pipeline, stage } = options;

  // Build filters for pipeline and/or stage
  const filters: Array<{ propertyName: string; operator: FilterOperatorEnum; value: string }> = [];
  if (pipeline) {
    filters.push({ propertyName: 'pipeline', operator: FilterOperatorEnum.Eq, value: pipeline });
  }
  if (stage) {
    filters.push({ propertyName: 'dealstage', operator: FilterOperatorEnum.Eq, value: stage });
  }

  const filterGroups = filters.length > 0 ? [{ filters }] : undefined;

  const response = await client.crm.deals.searchApi.doSearch({
    limit,
    after,
    properties,
    filterGroups,
  });

  return {
    results: response.results.map(r => ({
      id: r.id,
      dealname: r.properties.dealname ?? undefined,
      amount: r.properties.amount ?? undefined,
      dealstage: r.properties.dealstage ?? undefined,
      pipeline: r.properties.pipeline ?? undefined,
      closedate: r.properties.closedate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getPipelines(): Promise<Pipeline[]> {
  const client = getClient();
  const response = await client.crm.pipelines.pipelinesApi.getAll('deals');

  return response.results.map(p => ({
    id: p.id,
    label: p.label,
    displayOrder: p.displayOrder,
    stages: p.stages.map(s => ({
      id: s.id,
      label: s.label,
      displayOrder: s.displayOrder,
      metadata: s.metadata ?? {},
    })),
  }));
}

// Tickets
export async function getTickets(options: { limit?: number; after?: string; properties?: string[] } = {}): Promise<PaginatedResult<Ticket>> {
  const client = getClient();
  const { limit = 20, after, properties = ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_priority', 'createdate'] } = options;

  const response = await client.crm.tickets.basicApi.getPage(limit, after, properties);

  return {
    results: response.results.map(r => ({
      id: r.id,
      subject: r.properties.subject ?? undefined,
      content: r.properties.content ?? undefined,
      hs_pipeline: r.properties.hs_pipeline ?? undefined,
      hs_pipeline_stage: r.properties.hs_pipeline_stage ?? undefined,
      hs_ticket_priority: r.properties.hs_ticket_priority ?? undefined,
      createdate: r.properties.createdate ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getTicket(id: string, properties?: string[]): Promise<Ticket> {
  const client = getClient();
  const defaultProps = ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_priority', 'hs_ticket_category', 'createdate', 'hs_lastmodifieddate'];

  const response = await client.crm.tickets.basicApi.getById(id, properties ?? defaultProps);

  return {
    id: response.id,
    subject: response.properties.subject ?? undefined,
    content: response.properties.content ?? undefined,
    hs_pipeline: response.properties.hs_pipeline ?? undefined,
    hs_pipeline_stage: response.properties.hs_pipeline_stage ?? undefined,
    hs_ticket_priority: response.properties.hs_ticket_priority ?? undefined,
    hs_ticket_category: response.properties.hs_ticket_category ?? undefined,
    createdate: response.properties.createdate ?? undefined,
    lastmodifieddate: response.properties.hs_lastmodifieddate ?? undefined,
    properties: response.properties,
  };
}

export async function searchTickets(query: string, options: SearchOptions = {}): Promise<PaginatedResult<Ticket>> {
  const client = getClient();
  const { limit = 20, after, properties = ['subject', 'content', 'hs_pipeline_stage', 'hs_ticket_priority'] } = options;

  const response = await client.crm.tickets.searchApi.doSearch({
    query,
    limit,
    after,
    properties,
  });

  return {
    results: response.results.map(r => ({
      id: r.id,
      subject: r.properties.subject ?? undefined,
      content: r.properties.content ?? undefined,
      hs_pipeline_stage: r.properties.hs_pipeline_stage ?? undefined,
      hs_ticket_priority: r.properties.hs_ticket_priority ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

// Notes
export async function getNotes(objectType: string, objectId: string, options: { limit?: number; after?: string } = {}): Promise<PaginatedResult<Note>> {
  const client = getClient();
  const { limit = 20, after } = options;

  // Get associated notes
  const associations = await client.crm.associations.v4.basicApi.getPage(
    objectType,
    objectId,
    'notes',
    after,
    limit
  );

  if (!associations.results.length) {
    return { results: [] };
  }

  // Get note details
  const noteIds = associations.results.map(a => a.toObjectId);
  const notes = await Promise.all(
    noteIds.map(id =>
      client.crm.objects.notes.basicApi.getById(id, ['hs_note_body', 'hs_timestamp', 'hs_attachment_ids'])
    )
  );

  return {
    results: notes.map(n => ({
      id: n.id,
      hs_note_body: n.properties.hs_note_body ?? undefined,
      hs_timestamp: n.properties.hs_timestamp ?? undefined,
      hs_attachment_ids: n.properties.hs_attachment_ids ?? undefined,
      properties: n.properties,
    })),
  };
}

export async function createNote(objectType: string, objectId: string, body: string): Promise<Note> {
  const client = getClient();

  // Create the note
  const note = await client.crm.objects.notes.basicApi.create({
    properties: {
      hs_note_body: body,
      hs_timestamp: new Date().toISOString(),
    },
  });

  // Associate with object
  await client.crm.associations.v4.basicApi.create(
    'notes',
    note.id,
    objectType,
    objectId,
    [{ associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined, associationTypeId: getAssociationTypeId('notes', objectType) }]
  );

  return {
    id: note.id,
    hs_note_body: note.properties.hs_note_body ?? undefined,
    hs_timestamp: note.properties.hs_timestamp ?? undefined,
    properties: note.properties,
  };
}

// Tasks
export async function getTasks(options: { limit?: number; after?: string; properties?: string[] } = {}): Promise<PaginatedResult<Task>> {
  const client = getClient();
  const { limit = 20, after, properties = ['hs_task_subject', 'hs_task_body', 'hs_task_status', 'hs_task_priority', 'hs_timestamp'] } = options;

  const response = await client.crm.objects.tasks.basicApi.getPage(limit, after, properties);

  return {
    results: response.results.map(r => ({
      id: r.id,
      hs_task_subject: r.properties.hs_task_subject ?? undefined,
      hs_task_body: r.properties.hs_task_body ?? undefined,
      hs_task_status: r.properties.hs_task_status ?? undefined,
      hs_task_priority: r.properties.hs_task_priority ?? undefined,
      hs_timestamp: r.properties.hs_timestamp ?? undefined,
      properties: r.properties,
    })),
    paging: response.paging,
  };
}

export async function getTask(id: string, properties?: string[]): Promise<Task> {
  const client = getClient();
  const defaultProps = ['hs_task_subject', 'hs_task_body', 'hs_task_status', 'hs_task_priority', 'hs_task_type', 'hs_timestamp'];

  const response = await client.crm.objects.tasks.basicApi.getById(id, properties ?? defaultProps);

  return {
    id: response.id,
    hs_task_subject: response.properties.hs_task_subject ?? undefined,
    hs_task_body: response.properties.hs_task_body ?? undefined,
    hs_task_status: response.properties.hs_task_status ?? undefined,
    hs_task_priority: response.properties.hs_task_priority ?? undefined,
    hs_task_type: response.properties.hs_task_type ?? undefined,
    hs_timestamp: response.properties.hs_timestamp ?? undefined,
    properties: response.properties,
  };
}

export async function createTask(properties: {
  subject: string;
  body?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}): Promise<Task> {
  const client = getClient();

  const taskProperties: Record<string, string> = {
    hs_task_subject: properties.subject,
    hs_task_status: properties.status ?? 'NOT_STARTED',
  };

  if (properties.body) {
    taskProperties.hs_task_body = properties.body;
  }
  if (properties.dueDate) {
    taskProperties.hs_timestamp = properties.dueDate;
  }
  if (properties.priority) {
    taskProperties.hs_task_priority = properties.priority;
  }

  const response = await client.crm.objects.tasks.basicApi.create({ properties: taskProperties });

  return {
    id: response.id,
    hs_task_subject: response.properties.hs_task_subject ?? undefined,
    hs_task_body: response.properties.hs_task_body ?? undefined,
    hs_task_status: response.properties.hs_task_status ?? undefined,
    hs_task_priority: response.properties.hs_task_priority ?? undefined,
    properties: response.properties,
  };
}

// Associations
export async function getAssociations(fromType: string, fromId: string, toType: string): Promise<Association[]> {
  const client = getClient();

  const response = await client.crm.associations.v4.basicApi.getPage(fromType, fromId, toType);

  return response.results.map(r => ({
    fromObjectType: fromType,
    fromObjectId: fromId,
    toObjectType: toType,
    toObjectId: r.toObjectId,
    associationTypes: r.associationTypes.map(t => ({
      category: t.category,
      typeId: t.typeId,
      label: t.label ?? undefined,
    })),
  }));
}

export async function createAssociation(fromType: string, fromId: string, toType: string, toId: string): Promise<void> {
  const client = getClient();

  const typeId = getAssociationTypeId(fromType, toType);

  await client.crm.associations.v4.basicApi.create(
    fromType,
    fromId,
    toType,
    toId,
    [{ associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined, associationTypeId: typeId }]
  );
}

// Helper to get association type ID
function getAssociationTypeId(fromType: string, toType: string): number {
  // Common HubSpot association type IDs
  const associations: Record<string, Record<string, number>> = {
    contacts: { companies: 1, deals: 3, tickets: 15 },
    companies: { contacts: 2, deals: 5, tickets: 25 },
    deals: { contacts: 4, companies: 6, tickets: 27 },
    tickets: { contacts: 16, companies: 26, deals: 28 },
    notes: { contacts: 202, companies: 190, deals: 214, tickets: 226 },
    tasks: { contacts: 204, companies: 192, deals: 216, tickets: 228 },
  };

  return associations[fromType]?.[toType] ?? 0;
}

// Owners
export async function getOwners(): Promise<Owner[]> {
  const client = getClient();
  const response = await client.crm.owners.ownersApi.getPage();

  return response.results.map(o => ({
    id: o.id,
    email: o.email ?? '',
    firstName: o.firstName ?? undefined,
    lastName: o.lastName ?? undefined,
    userId: o.userId ?? undefined,
  }));
}
