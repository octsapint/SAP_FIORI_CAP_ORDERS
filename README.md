# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

# Supplier Order Reprocessing

CAP project for logging and reprocessing failed supplier orders on SAP BTP using PostgreSQL.

## Prerequisites
- Node.js 20+
- PostgreSQL database or Docker image for local tests
- Cloud Foundry CLI
- MBT (`npm install -g mbt`)

## Setup & Local Run
```bash
npm install
cds watch
```
The service is available at `http://localhost:4004/odata/v4/supplier-order/`.
Check service health via `http://localhost:4004/health`.

## Cloud Foundry Deploy
```bash
npx cds build --production
mbt build
cf deploy mta_archives/orders_1.0.0.mtar
```
Ensure PostgreSQL and XSUAA instances with plans `trial`/`lite` exist.

## Environment
For local PostgreSQL, provide credentials via environment variables or `VCAP_SERVICES` in `.env`:
```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=postgres
```

## Actions
Use the [api.http](api.http) file or any REST client.
- `POST /Resend` with `{ "orderIDs": [1] }`
- `POST /Cancel` with `{ "orderIDs": [1] }`
- `POST /Archive` with `{ "orderIDs": [1] }`

## Troubleshooting
- Ensure service plans (`trial`, `lite`, `default`) exist on the subaccount.
- `Cannot GET /odata/v4/supplier-order/...` → verify service path in `service.cds`.
- `npm ci` failures in CF builds → switch to `npm install --omit=dev` in `mta.yaml`.