// HubSpot CRM Types

export interface Contact {
  id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
  lifecyclestage?: string;
  hs_lead_status?: string;
  createdate?: string;
  lastmodifieddate?: string;
  properties: Record<string, string | null>;
}

export interface Company {
  id: string;
  name?: string;
  domain?: string;
  industry?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  numberofemployees?: string;
  annualrevenue?: string;
  description?: string;
  createdate?: string;
  lastmodifieddate?: string;
  properties: Record<string, string | null>;
}

export interface Deal {
  id: string;
  dealname?: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  closedate?: string;
  hs_deal_stage_probability?: string;
  dealtype?: string;
  description?: string;
  createdate?: string;
  lastmodifieddate?: string;
  properties: Record<string, string | null>;
}

export interface Ticket {
  id: string;
  subject?: string;
  content?: string;
  hs_pipeline?: string;
  hs_pipeline_stage?: string;
  hs_ticket_priority?: string;
  hs_ticket_category?: string;
  createdate?: string;
  lastmodifieddate?: string;
  properties: Record<string, string | null>;
}

export interface Note {
  id: string;
  hs_note_body?: string;
  hs_timestamp?: string;
  hs_attachment_ids?: string;
  properties: Record<string, string | null>;
}

export interface Task {
  id: string;
  hs_task_subject?: string;
  hs_task_body?: string;
  hs_task_status?: string;
  hs_task_priority?: string;
  hs_task_type?: string;
  hs_timestamp?: string;
  properties: Record<string, string | null>;
}

export interface Association {
  fromObjectType: string;
  fromObjectId: string;
  toObjectType: string;
  toObjectId: string;
  associationTypes: Array<{
    category: string;
    typeId: number;
    label?: string;
  }>;
}

export interface Pipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: Record<string, string>;
}

export interface PortalInfo {
  portalId: number;
  timeZone: string;
  currency: string;
  domain?: string;
  companyName?: string;
}

export interface Owner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
}

export type ObjectType = 'contacts' | 'companies' | 'deals' | 'tickets' | 'notes' | 'tasks';

export interface SearchFilter {
  propertyName: string;
  operator: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE' | 'CONTAINS_TOKEN' | 'NOT_CONTAINS_TOKEN';
  value: string;
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilter[];
  sorts?: Array<{ propertyName: string; direction: 'ASCENDING' | 'DESCENDING' }>;
  properties?: string[];
  limit?: number;
  after?: string;
}

export interface PaginatedResult<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

// OAuth Types
export type AuthMethod = 'token' | 'oauth';

export interface OAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;  // Unix timestamp (ms)
  tokenType: string;
  scopes: string[];
}

export interface OAuthAppConfig {
  clientId: string;
  clientSecret: string;
}
