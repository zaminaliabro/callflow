# Deploying CallFlow to Vercel + Supabase

Everything runs in **one Vercel project**: the React app is served as static files,
and the Express API runs as a serverless function at `/api/*` (`api/index.js`).
The database is **Supabase Postgres**.

---

## 1. Create the database (Supabase)

1. Go to <https://supabase.com> → **New project**. Pick a name, a strong DB
   password, and a region close to you. Wait for it to finish provisioning.
2. **Project Settings → Database → Connection string**. You need two URLs:

   | Env var        | Which string | Port | Extra |
   |----------------|--------------|------|-------|
   | `DATABASE_URL` | **Connection pooling** (Transaction mode) | `6543` | append `?pgbouncer=true` |
   | `DIRECT_URL`   | **Direct connection** | `5432` | — |

   They look like:

   ```
   DATABASE_URL="postgresql://postgres.abcd:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.abcd:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   ```

   Replace `PASSWORD` with the DB password you set. If it contains special
   characters, URL-encode them (`@` → `%40`, `#` → `%23`, …).

---

## 2. Create tables + seed data (run once, from your machine)

Point your local server at Supabase temporarily and push the schema:

```bash
cd server
# put the two Supabase URLs in server/.env as DATABASE_URL and DIRECT_URL
npx prisma db push          # creates all tables on Supabase
npm run db:seed             # admin + 4 agents + 60 customers + call history
```

> Alternative to `db push`: open **Supabase → SQL Editor** and run
> `server/prisma/manual-schema.sql`, then `npm run db:seed`.

After this, switch `server/.env` back to your **local** database if you still
want to develop locally.

---

## 3. Deploy on Vercel (dashboard)

1. <https://vercel.com/new> → **Import** the GitHub repo `zaminaliabro/callflow`.
2. **Root Directory:** leave as the repo root (`./`).
3. **Framework Preset:** *Other* (the included `vercel.json` handles build +
   routing — build command `npm run vercel-build`, output `client/dist`).
4. **Environment Variables** — add these (Production + Preview):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | the Supabase **pooled** URL (`:6543` + `?pgbouncer=true`) |
   | `DIRECT_URL` | the Supabase **direct** URL (`:5432`) |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` *(optional)* |

5. **Deploy.** First build runs `prisma generate` then builds the client.

When it's live, open the deployment URL and sign in:

| Role  | Email                 | Password   |
|-------|-----------------------|------------|
| Admin | `admin@callflow.test` | `admin123` |
| Agent | `hamza@callflow.test` | `agent123` |

---

## Deploy via CLI instead (optional)

```bash
npm i -g vercel
vercel login                     # opens the browser
vercel link                      # from the callflow/ folder
vercel env add DATABASE_URL      # repeat for DIRECT_URL, JWT_SECRET
vercel --prod
```

---

## Redeploys

Every `git push` to `main` triggers a new Vercel deployment automatically.
Schema changes: run `npx prisma db push` (or `prisma migrate deploy`) against
Supabase, then push.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `PrismaClientInitializationError` / engine not found | Confirm `binaryTargets` in `schema.prisma` includes `rhel-openssl-3.0.x` (it does) and that the build ran `prisma generate`. |
| API 500s with `too many connections` | Make sure `DATABASE_URL` is the **pooled** `:6543` string with `?pgbouncer=true`. |
| `/api/...` returns the HTML app instead of JSON | `vercel.json` rewrites must be intact (the `/api/(.*)` rule comes first). |
| Login works locally but not on Vercel | `JWT_SECRET` env var missing in Vercel project settings. |
