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