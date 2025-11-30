This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment variables

Copy `.env.example` to `.env.local` and fill:

| Key | Where to get it | Scope |
|-----|-----------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Settings → API | Browser + Server |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Same screen | Browser + Server |
| SUPABASE_SERVICE_ROLE_KEY | **Keep secret** (server only) | Server |


🔑 Env-var quick rules (add to README)

Where the code runs	How to read env vars	Example
Server-only modules(files not matched by the ESLint globs)	import { env } from "@/env"	env.SUPABASE_SERVICE_ROLE_KEY
Anything that can reach the browser(files matched by the globs)	process.env.NEXT_PUBLIC_* or a thin envPublic helper	process.env.NEXT_PUBLIC_SUPABASE_URL

Why:
	•	@/env contains secrets—safe only on the server.
	•	NEXT_PUBLIC_* vars are stripped of secrets and can be bundled.

Guardrails:

	•	ESLint blocks @/env in client-side paths:
src/components/**, src/hooks/**, src/app/**/page.tsx, src/app/**/layout.tsx, *client* files.
	•	Litmus test: “Will this module execute in the browser?”
Yes → use NEXT_PUBLIC_*; No → you may use @/env.

## Supabase Type Generation (Keeping Types in Sync)

Regenerate the TypeScript types after any schema migration (add/drop column, nullability change).

### One-off Generation

```bash
supabase login            # Opens browser to authenticate (stores token locally)
supabase gen types typescript \
	--project-id YOUR_PROJECT_ID \
	--schema public > src/lib/supabase/types.ts
```

If you prefer `npx` (no global install):
```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/supabase/types.ts
```

### Using an Access Token (CI or Non-interactive)

```bash
export SUPABASE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/supabase/types.ts
```

### Optional `package.json` Script

Add:
```jsonc
"scripts": {
	"types:gen": "supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/supabase/types.ts"
}
```
Run:
```bash
npm run types:gen
```

### After Regeneration

```bash
npm run build   # Surfacing type errors introduced by schema changes
git diff src/lib/supabase/types.ts
```
Fix any queries referencing removed/renamed columns.

## Auth Redirect Configuration (Prevent Localhost Leakage)

Define a public site base URL to ensure OAuth always returns to production:

In Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_SITE_URL=https://YOUR_DEPLOYED_DOMAIN
```

In Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://YOUR_DEPLOYED_DOMAIN
Redirect URLs:
	https://YOUR_DEPLOYED_DOMAIN/auth/callback
```

### Building Redirect Targets in Code

Use an explicit base (example shown in `login/page.tsx`):
```ts
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
// Magic link
emailRedirectTo: `${baseUrl}/auth/callback`
// Google OAuth
redirectTo: `${baseUrl}/auth/callback?next=/sessions`
```

This prevents `http://localhost:3000` from appearing in the Supabase OAuth state when running on production.

## Common Pitfalls

- Forgot `supabase login` → "Access token not provided" error.
- Missing `NEXT_PUBLIC_SITE_URL` → fallback may capture preview/local origin.
- Stale service role key rotated → server actions fail silently.
- Not updating allowed redirect URLs after adding new query params (e.g. `?next=/sessions`).

## Quick Checklist

- [ ] Run migrations
- [ ] `npm run types:gen`
- [ ] `npm run build` (fix type errors)
- [ ] Update Supabase Auth Site/Redirect URLs if domain changed
- [ ] Commit regenerated `types.ts`
