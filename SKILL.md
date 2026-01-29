---
name: hubspot
description: HubSpot CRM CLI for managing contacts, companies, deals, tickets, and engagements. Use when the user asks about HubSpot data, wants to search CRM records, create contacts/deals, or manage associations.
---

# HubSpot CLI

HubSpot CRM CLI for managing contacts, companies, deals, and engagements.

## When to Use

Use this skill when the user:
- Asks to look up a contact, company, or deal in HubSpot
- Wants to search HubSpot CRM for specific records
- Needs to create or update contacts, deals, or companies
- Asks about deal pipelines or stages
- Wants to view or create notes/tasks
- Needs to check associations between CRM objects

## Install

```bash
npm install -g @cyberdrk/hs
```

Or from source:
```bash
cd ~/Code/cyberdrk305/hubspot && npm install && npm run build && npm link
```

## Authentication

First-time setup requires a Private App access token from HubSpot:

1. Go to HubSpot Settings > Integrations > Private Apps (under "Legacy Apps")
2. Create a new Private App with required scopes
3. Run `hs auth` and paste the access token (starts with `pat-`)

```bash
hs auth
```

## Commands

### Auth & Status
```bash
hs auth                    # Configure access token
hs check                   # Verify authentication
hs whoami                  # Show portal info
```

### Contacts
```bash
hs contacts                          # List contacts
hs contacts -n 50                    # List 50 contacts
hs contact <id>                      # Get contact details
hs contact-search "john"             # Search contacts
hs contact-create --email x@y.com --firstname John
hs contact-update <id> --phone "555-1234"
```

### Companies
```bash
hs companies                         # List companies
hs company <id>                      # Get company details
hs company-search "acme"             # Search companies
```

### Deals
```bash
hs deals                             # List deals
hs deals --pipeline <id>             # Filter by pipeline ID
hs deals --stage <id>                # Filter by stage ID
hs deal <id>                         # Get deal details
hs deal-search "enterprise"          # Search deals
hs pipelines                         # List pipelines and stages
```

### Tickets
```bash
hs tickets                           # List tickets
hs ticket <id>                       # Get ticket details
hs ticket-search "issue"             # Search tickets
```

### Notes & Tasks
```bash
hs notes contacts <id>               # List notes for contact
hs note-create contacts <id> "Note text"
hs tasks                             # List tasks
hs task <id>                         # Get task details
hs task-create --subject "Follow up" --due "2024-12-31" --priority HIGH
```

### Associations
```bash
hs associations contacts <id> companies    # List company associations
hs associate contacts <id1> deals <id2>    # Create association
```

## Output Formats

All commands support:
- Default: Colored terminal output
- `--json`: JSON output for scripting (clean, pipeable to jq)
- `--markdown`: Markdown table output

```bash
hs contacts --json              # JSON format
hs deals --markdown             # Markdown tables
```

### JSON Output & Piping

JSON output is clean and can be piped directly to `jq`:

```bash
# Get pipeline ID for first deal
hs deals --json | jq '.results[0].pipeline'

# Filter deals by pipeline and extract names
hs deals --pipeline 831085590 --json | jq '.results[].dealname'

# Get contact emails
hs contacts --json | jq -r '.results[].email'

# Count deals in a stage
hs deals --pipeline 831085590 --stage 1231737429 --json | jq '.results | length'
```

Note: Pagination info is included in the JSON response as `.paging.next.after`.

## Pagination

List commands support pagination:
```bash
hs contacts -n 50               # Limit to 50 results
hs contacts --after <cursor>    # Next page using cursor
```

## Examples

Check authentication:
```bash
hs check
```

Search for a contact:
```bash
hs contact-search "john@example.com"
```

View deal pipeline stages:
```bash
hs pipelines
```

Create a task:
```bash
hs task-create --subject "Schedule demo" --priority HIGH --due "2024-12-15"
```

## Limitations

- **Views not supported:** The CLI cannot filter by HubSpot saved view IDs from URLs
- When given a view URL like `/views/57091019/`, you must manually identify which pipeline the view filters and use `--pipeline <id>` instead
- Use `hs pipelines` to list all pipelines and their IDs

## View URL Workaround

If given a HubSpot view URL like `https://app.hubspot.com/contacts/.../views/57091019/list`:

1. Ask the user which pipeline it filters
2. Open the view in browser to identify the pipeline
3. Use `hs pipelines` and match by name

The view ID in the URL is **not** a pipeline ID - they are different concepts in HubSpot.

## Notes

- IDs are HubSpot object IDs (numeric strings)
- Dates use ISO format (YYYY-MM-DD or full ISO timestamp)
- Priority values: LOW, MEDIUM, HIGH
- Task status values: NOT_STARTED, IN_PROGRESS, COMPLETED
