# Inner Revealing LMS web

Web-only eLMS frontend for https://ir.vishwalabs.com, built with Next.js 15, React and TypeScript. The marketing website remains in the repository root. Mobile apps are not included here.

```sh
cp .env.example .env
npm ci
npm run dev
```

For production, configure `.env`, run `npm run build`, then `PORT=8010 npm start`. Public environment variables are embedded during the build. `npm start` binds to localhost for use behind a reverse proxy.

`NEXT_PUBLIC_WEB_NAME` and `NEXT_PUBLIC_WEB_LOGO` configure the site's name and logo. Clarity analytics are disabled unless `NEXT_PUBLIC_CLARITY_PROJECT_ID` is supplied. The web application uses a same-origin backend and local MySQL for accounts, sessions and courses. Firebase and mobile app integrations are not used.

The frontend uses a calm meditation and yoga theme with three practice areas: Meditation, Yoga & Breathwork, and Personal Growth. Contact details and social links come from the existing Inner Revealing website. The contact form prepares an enquiry for the visitor to send through the centre's official WhatsApp or email.

Configure the server-only `DB_*` variables, then run `npm run db:migrate` before building. Migrations create the schema and official site configuration; they never seed courses or accounts. Courses stay empty until real content is added. Do not use vendor/demo databases or external API fallbacks.

Email/password registration, sign-in, sign-out, password changes and account deletion use the local web backend. Passwords are hashed and sessions use HTTP-only cookies. Automated password-reset email, payments, and unsupported instructor operations remain unavailable until their real services are configured.

See [deployment instructions](deploy/README.md) for the server path, service, logs and update procedure. Run `npx tsc --noEmit` and `npm run build` to verify changes.
