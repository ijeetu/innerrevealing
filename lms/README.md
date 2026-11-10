# Inner Revealing LMS web

Web-only eLMS frontend for https://ir.vishwalabs.com, built with Next.js 15, React and TypeScript. The marketing website remains in the repository root. Mobile apps are not included here.

```sh
cp .env.example .env
npm ci
npm run dev
```

For production, configure `.env`, run `npm run build`, then `PORT=8010 npm start`. Public environment variables are embedded during the build. `npm start` binds to localhost for use behind a reverse proxy.

`NEXT_PUBLIC_WEB_NAME` and `NEXT_PUBLIC_WEB_LOGO` override the API's name and logo. Clarity analytics are disabled unless `NEXT_PUBLIC_CLARITY_PROJECT_ID` is supplied. Firebase authentication and push notifications stay inactive while configuration is absent or contains placeholders.

The initial deployment uses the supplied vendor demo API. The production eLMS backend, Firebase project, course data and payment configuration must be supplied separately before learner onboarding.

See [deployment instructions](deploy/README.md) for the server path, service, logs and update procedure. Run `npx tsc --noEmit` and `npm run build` to verify changes.
