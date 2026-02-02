# MCP servers for this project

## Railway MCP Server

The **Railway** MCP server is configured here so Cursor (and other MCP hosts) can manage your Railway projects from the IDE.

- **What it does:** Lets you use natural language to deploy, list services, pull env vars, generate domains, view logs, etc. on Railway.
- **Runs:** Locally (via `npx @railway/mcp-server`); it uses the Railway CLI under the hood. It does **not** run on Railway Cloud—it connects Cursor to Railway’s API.

### Prerequisites

1. **Railway CLI** installed and logged in:
   ```bash
   npm i -g @railway/cli
   railway login
   ```
2. **Link this project** (optional but useful):
   ```bash
   railway link
   ```
   Choose your S&R backend project and service when prompted.

### After adding this config

1. Restart Cursor (or reload the window) so it picks up `.cursor/mcp.json`.
2. In chat/composer you can ask things like:
   - “List my Railway services”
   - “Pull environment variables and save to .env”
   - “Generate a domain for my backend service”
   - “Show logs for my API service”

### Note

Railway’s MCP server is **experimental**. Destructive actions (e.g. deleting services) are not exposed. Always review what the AI is about to run.
