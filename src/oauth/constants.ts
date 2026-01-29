// OAuth Configuration Constants

export const HUBSPOT_AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
export const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';

// Local callback server configuration
export const CALLBACK_PORT = 3847;
export const CALLBACK_PATH = '/callback';
export const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;

// Token refresh buffer (5 minutes before expiry)
export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

// Callback server timeout (2 minutes for user to complete authorization)
export const CALLBACK_TIMEOUT_MS = 2 * 60 * 1000;

// Default OAuth scopes for CLI functionality
export const DEFAULT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.companies.read',
  'crm.objects.companies.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.objects.owners.read',
  'crm.schemas.contacts.read',
  'crm.schemas.contacts.write',
  'crm.schemas.companies.read',
  'crm.schemas.deals.read',
  'oauth',
  'tickets',
  'account-info.security.read',
];
