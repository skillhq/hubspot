# HubSpot CLI

A fast, focused CLI for HubSpot CRM operations.

## Installation

```bash
npm install -g @skillhq/hubspot
```

Or from source:
```bash
git clone https://github.com/skillhq/hubspot.git
cd hubspot
npm install
npm run build
npm link
```

## Authentication

The CLI supports two authentication methods:

| | OAuth 2.0 | Private App Token |
|---|---|---|
| **Best for** | Teams | Personal use |
| **Data access** | User's permissions apply | Portal-wide access |
| **Setup** | One-time app creation, then each user logs in | Single token for one user |
| **Token management** | Auto-refreshes | Never expires |

### Option 1: OAuth 2.0 (Recommended for Teams)

OAuth lets multiple team members authenticate with their own HubSpot accounts using a shared app. **Each user can only access data they have permission to see in the HubSpot UI** - their individual role and permissions apply.

**First-time setup (one person creates the app):**

1. Go to your [HubSpot Developer Portal](https://app.hubspot.com/developer-overview/)
2. Click **Development** in the left sidebar, then **Legacy Apps**
3. Click **Create app** and give it a name (e.g., "Team CLI")
4. Go to the **Auth** tab:
   - Copy the **Client ID** and **Client Secret**
   - Under **Redirect URLs**, add: `http://localhost:3847/callback`
   - Under **Scopes**, add all required scopes (see below)
5. Share the Client ID and Client Secret with your team (via secure channel)

**For each team member:**

```bash
# Set credentials (one-time)
export HUBSPOT_CLIENT_ID=your-client-id
export HUBSPOT_CLIENT_SECRET=your-client-secret

# Login (opens browser for HubSpot authorization)
hubspot auth login
```

Or pass credentials directly:
```bash
hubspot auth login --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

**Managing OAuth sessions:**
```bash
hubspot auth status   # Check token expiry
hubspot auth logout   # Clear credentials
```

### Option 2: Private App Token (Simple, Single User)

For personal use or quick setup. **Note:** Private App Tokens have portal-wide access - they can see all data the scopes allow, regardless of individual user permissions.

1. In HubSpot, go to **Settings > Integrations > Private Apps**
2. Create a new Private App with required scopes (see below)
3. Copy the access token (starts with `pat-`)
4. Configure the CLI:
   ```bash
   hubspot auth -t pat-your-token-here
   # Or run `hubspot auth` and paste when prompted
   ```

## Required Scopes

Add these scopes to your OAuth app or Private App:

| Scope | Purpose |
|-------|---------|
| `crm.objects.contacts.read` | Read contacts |
| `crm.objects.contacts.write` | Create/update contacts |
| `crm.objects.companies.read` | Read companies |
| `crm.objects.companies.write` | Create/update companies |
| `crm.objects.deals.read` | Read deals |
| `crm.objects.deals.write` | Create/update deals |
| `crm.objects.owners.read` | List owners |
| `crm.schemas.contacts.read` | Read contact properties |
| `crm.schemas.contacts.write` | (OAuth only) Required for OAuth apps |
| `crm.schemas.companies.read` | Read company properties |
| `crm.schemas.deals.read` | Read deal properties |
| `tickets` | Read/write tickets |
| `oauth` | (OAuth only) Required for OAuth flow |
| `account-info.security.read` | Read portal info |

## Verify Connection

```bash
hubspot check
```

## Usage

### Contacts
```bash
hubspot contacts                              # List contacts
hubspot contact <id>                          # Get contact
hubspot contact-search "query"                # Search
hubspot contact-create --email user@example.com --firstname John
hubspot contact-update <id> --lastname Smith
```

### Companies
```bash
hubspot companies                             # List companies
hubspot company <id>                          # Get company
hubspot company-search "query"                # Search
```

### Deals
```bash
hubspot deals                                 # List deals
hubspot deal <id>                             # Get deal
hubspot deal-search "query"                   # Search
hubspot pipelines                             # List pipelines
```

### Tickets
```bash
hubspot tickets                               # List tickets
hubspot ticket <id>                           # Get ticket
hubspot ticket-search "query"                 # Search
```

### Notes & Tasks
```bash
hubspot notes <objectType> <id>               # List notes
hubspot note-create <objectType> <id> "body"  # Create note
hubspot tasks                                 # List tasks
hubspot task <id>                             # Get task
hubspot task-create --subject "Task" --due "2024-12-31"
```

### Associations
```bash
hubspot associations <from> <id> <to>         # List associations
hubspot associate <from> <id1> <to> <id2>     # Create association
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
