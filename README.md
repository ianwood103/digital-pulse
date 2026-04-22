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

## Strava Setup

The running section pulls live activity data from Strava. Add the following to `.env.local` (never commit this file):

```
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
```

### Getting the credentials

1. Create an app at [https://www.strava.com/settings/api](https://www.strava.com/settings/api). Set the "Authorization Callback Domain" to `localhost`.
2. Authorize the `activity:read_all` scope by visiting:
   ```
   https://www.strava.com/oauth/authorize?client_id=<id>&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
   ```
3. After approving, grab the `code` query parameter from the redirect URL.
4. Exchange the code for a refresh token:
   ```bash
   curl -X POST https://www.strava.com/api/v3/oauth/token \
     -d client_id=<id> \
     -d client_secret=<secret> \
     -d code=<code> \
     -d grant_type=authorization_code
   ```
   The response JSON contains `refresh_token` — copy that into `.env.local`.

If the env vars are missing, the running section renders a "not connected" state and no network calls are made.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
