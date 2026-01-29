# HubSpot CLI

A fast, focused CLI for HubSpot CRM operations.

## Installation

```bash
npm install -g @cyberdrk/hs
```

Or from source:
```bash
git clone https://github.com/cyberdrk305/hubspot.git
cd hubspot
npm install
npm run build
npm link
```

## Quick Start

1. Create a Private App in HubSpot:
   - Go to Settings > Integrations > Private Apps (under "Legacy Apps")
   - Create app with required scopes (see below)
   - Copy the access token (starts with `pat-`)

2. Configure the CLI:
   ```bash
   hs auth
   ```

3. Verify connection:
   ```bash
   hs check
   ```

## Required Scopes

When creating your Private App, grant these scopes:

**CRM:**
- `crm.objects.contacts.read` / `crm.objects.contacts.write`
- `crm.objects.companies.read` / `crm.objects.companies.write`
- `crm.objects.deals.read` / `crm.objects.deals.write`
- `crm.objects.owners.read`
- `crm.schemas.contacts.read` (for custom properties)
- `crm.schemas.companies.read`
- `crm.schemas.deals.read`

**Tickets:**
- `tickets` (read/write)

**Settings:**
- `account-info.security.read` (for portal info)

## Usage

### Contacts
```bash
hs contacts                              # List contacts
hs contact <id>                          # Get contact
hs contact-search "query"                # Search
hs contact-create --email user@example.com --firstname John
hs contact-update <id> --lastname Smith
```

### Companies
```bash
hs companies                             # List companies
hs company <id>                          # Get company
hs company-search "query"                # Search
```

### Deals
```bash
hs deals                                 # List deals
hs deal <id>                             # Get deal
hs deal-search "query"                   # Search
hs pipelines                             # List pipelines
```

### Tickets
```bash
hs tickets                               # List tickets
hs ticket <id>                           # Get ticket
hs ticket-search "query"                 # Search
```

### Notes & Tasks
```bash
hs notes <objectType> <id>               # List notes
hs note-create <objectType> <id> "body"  # Create note
hs tasks                                 # List tasks
hs task <id>                             # Get task
hs task-create --subject "Task" --due "2024-12-31"
```

### Associations
```bash
hs associations <from> <id> <to>         # List associations
hs associate <from> <id1> <to> <id2>     # Create association
```

## Output Formats

- Default: Colored terminal output
- `--json`: JSON for scripting
- `--markdown`: Markdown tables

## Configuration

Config stored at `~/.config/hs/config.json5`:
```json5
{
  accessToken: "pat-xxx",
  portalId: "12345678",
  defaultFormat: "plain",
  defaultLimit: 20
}
```

## License

MIT
