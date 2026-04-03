# AI Ticket Triage

Minimal full-stack application for rule-based support ticket triage.

Tech stack:
- Backend: Node.js + Express
- Frontend: Vanilla HTML, CSS, JavaScript
- Storage: SQLite
- Containers: Docker + Docker Compose

## Project Structure

```text
root/
├─ frontend/
│  ├─ Dockerfile
│  ├─ index.html
│  ├─ nginx.conf
│  ├─ script.js
│  └─ style.css
├─ backend/
│  ├─ Dockerfile
│  ├─ index.js
│  ├─ package.json
│  └─ src/
│     ├─ analyzer/
│     │  ├─ keywordConfig.js
│     │  └─ ticketAnalyzer.js
│     ├─ controllers/
│     │  └─ ticketController.js
│     ├─ data/
│     │  └─ tickets.db
│     ├─ routes/
│     │  └─ ticketRoutes.js
│     └─ services/
│        └─ ticketService.js
└─ docker-compose.yml
```

## Features

- Analyze a support ticket with `POST /tickets/analyze`
- List stored tickets with `GET /tickets`
- Keyword and phrase-based classification
- Separate urgency and priority fields
- Security issue override for `P0`
- Confidence score using weighted category scoring
- Frontend validation and error handling
- Dockerized frontend and backend services

## Current Classification Logic

Categories:
- `Billing`
- `Technical`
- `Account`
- `Feature Request`
- `Other`

Keyword coverage includes single words and phrases such as:
- Billing: `payment`, `refund`, `invoice`, `charge`, `billing`, `subscription`, `transaction`
- Technical: `error`, `bug`, `crash`, `failure`, `issue`, `not working`, `broken`, `down`, `slow`
- Account: `login`, `password`, `account`, `signup`, `username`, `access`, `locked`, `reset`
- Feature Request: `feature`, `request`, `suggestion`, `improve`, `add`, `enhancement`, `would like`

Matching is case-insensitive because messages are converted to lowercase before analysis.

## Current Urgency Logic

- `high`: `urgent`, `asap`, `immediately`, `critical`, `priority`, `down`, `outage`, `system failure`
- `medium`: `soon`
- `low`: default

## Current Priority Logic

- `P0`
  - Security keywords: `hacked`, `unauthorized`, `breach`, `stolen`, `compromised`, `fraud`
  - Refund rule
  - Critical keywords such as `down`, `outage`, `critical`, `urgent`, `asap`, `system failure`
  - High urgency combined with a technical incident
- `P1`
  - High-impact technical/account issues such as `not working`, `broken`, `error`, `failed`, `cannot`
- `P2`
  - Medium urgency or general billing/account/other issues
- `P3`
  - Feature requests and low-priority general requests

## Confidence Score

Confidence is calculated per category using a weighted score:

- `40%` match ratio
- `40%` matched keyword weight ratio
- `20%` exclusivity bonus

If the best category score is below `25`, the ticket is classified as `Other`.

## API Endpoints

### `GET /health`

Health check endpoint.

Example response:

```json
{
  "status": "ok"
}
```

### `GET /tickets`

Returns all saved tickets.

Example response:

```json
[]
```

### `POST /tickets/analyze`

Request body:

```json
{
  "message": "My payment failed and I need a refund asap"
}
```

Example response:

```json
{
  "id": 1,
  "message": "My payment failed and I need a refund asap",
  "category": "Billing",
  "isSecurityIssue": false,
  "urgency": "high",
  "priority": "P0",
  "keywords": ["payment", "refund", "asap", "failed"],
  "confidence": 44.76,
  "createdAt": "2026-04-03T00:00:00.000Z"
}
```

## Frontend Validation and Error Handling

Frontend behavior:
- Empty input: `Message cannot be empty. Please describe your issue.`
- Too short input: `Please provide more details about your issue.`
- Offline/network issue: `Unable to analyze ticket. Check your connection.`
- Backend server error: `Server error, please try again`
- Backend validation errors are shown directly in the UI
- Previous analysis is cleared on error
- Submit button is re-enabled after request completion

Backend behavior:
- `400`: `A non-empty message is required.`
- `500`: `Internal server error`
- Ticket save failures are logged and the analysis response is still returned



## Running With Docker

From the project root:

```bash
docker compose up --build
```

Then open:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend health: [http://localhost:5000/health](http://localhost:5000/health)
- Backend tickets: [http://localhost:5000/tickets](http://localhost:5000/tickets)

To stop:

```bash
docker compose down
```

## Quick Test Commands

PowerShell example:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/tickets/analyze" `
  -ContentType "application/json" `
  -Body '{"message":"My account was hacked and I need help asap"}'
```

Expected result:
- `priority` should be `P0`
- `isSecurityIssue` should be `true`

## Notes

- Stored tickets now live in SQLite at `backend/src/data/tickets.db`
- The database file is created automatically when the backend starts
- Frontend Docker uses nginx as a static server and reverse proxy to the backend

## Reflection

This project was designed to stay simple, readable, and easy to run locally. I chose a small SQLite data model because it satisfies the database requirement without adding the setup cost of a larger database server. Each ticket stores the original message, analysis output, and timestamp, which is enough for this scope without adding unnecessary complexity.

The API structure uses two endpoints: `POST /tickets/analyze` for the main analysis workflow and `GET /tickets` for viewing saved results. I chose this because it maps directly to the two main user actions in the UI and keeps the frontend integration straightforward. The backend is separated into controller, service, and analyzer layers so responsibilities stay clear even though the app is small.

For classification, I used rule-based keyword and phrase matching instead of external AI services. That choice keeps the project deterministic, fast, and easy to explain. The weighted confidence scoring adds a bit more structure than simple keyword counting, while still being understandable and lightweight.

The main trade-off is that rule-based classification is limited. It works well for known keywords and phrases, but it can miss spelling mistakes, unusual phrasing, or more nuanced intent. SQLite is a good fit for a local assignment project, but it is still not ideal for large-scale production traffic or more advanced querying needs.

With more time, I would improve the accuracy of the analyzer, normalize repeated or overlapping keywords better, add automated tests, and use a real database. I would also improve observability with structured logs and make the frontend show richer ticket history states such as loading, empty, and retry actions.
