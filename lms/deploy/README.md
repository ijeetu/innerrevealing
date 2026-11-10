# Inner Revealing LMS deployment

The web frontend is served at https://ir.vishwalabs.com. The existing marketing website remains in the repository root; this app is independent in `lms/`. Mobile source is not included.

## Server

- Site user: `innerrevealing`
- App directory: `/home/innerrevealing/htdocs/ir.vishwalabs.com`
- Runtime: Node.js 22 at `/opt/node22-v22.23.2/bin/node`
- Local upstream: `127.0.0.1:8010`
- Process: `innerrevealing-lms.service`, enabled at boot
- HTTPS and reverse proxy: CloudPanel / Nginx

## Configuration and updates

Copy `.env.example` to `.env` and configure the production values. Keep `.env` off Git. `NEXT_PUBLIC_*` settings are embedded at build time: rebuild after changing them.

```sh
cd /home/innerrevealing/htdocs/ir.vishwalabs.com
export PATH=/opt/node22-v22.23.2/bin:$PATH
npm ci --no-audit --no-fund
npm run db:migrate
npm run build
# Run as root after a successful build:
systemctl restart innerrevealing-lms
systemctl status innerrevealing-lms --no-pager
```

Run dependency installation and builds as the site user. Keep the previous release or a backup before updating source. Logs are available with `journalctl -u innerrevealing-lms`.

## Local MySQL backend

The web backend is part of this Next.js application and serves same-origin `/api` routes. The database runs locally at `127.0.0.1:3306`; the dedicated database is `irlmsdb` and the application user is `irlmsweb`. Its password is stored only in the server's protected `.env` file. Database credentials must never use a `NEXT_PUBLIC_` prefix or enter Git.

Set `SITE_URL=https://ir.vishwalabs.com` and the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` variables before running migrations. The schema includes local users, hashed cookie sessions and courses. Migrations do not seed courses or accounts. Never import demo data or configure a vendor API fallback.

The frontend clears the old vendor application's persisted browser data when moving to this backend. Firebase, social-provider sign-in, phone OTP and push notifications are removed from this web launch. Real course content and payment/mail services can be configured separately; unsupported operations fail explicitly instead of simulating success.

## Checks

```sh
curl -I http://127.0.0.1:8010
curl -I https://ir.vishwalabs.com
systemctl is-enabled innerrevealing-lms
```

Check the homepage and `/courses` in a browser, including browser network requests. TLS certificate renewal is managed by CloudPanel.

## Admin, integrations and private media

- Admin login: `https://ir.vishwalabs.com/admin/login`
- Owner account: provision explicitly with `npm run admin:bootstrap`; never commit bootstrap passwords.
- `APP_ENCRYPTION_KEY`: stable 32-byte secret, stored only in the protected server `.env`. Back it up securely; changing it makes stored integration credentials unreadable until re-entered.
- `UPLOAD_DIR=/home/innerrevealing/shared/uploads`: durable media storage outside release directories and the public web root. The application user owns it; lesson files require enrolment or administrator permission.
- SMTP and Razorpay credentials are configured by the superadmin in the panel, encrypted in MySQL and omitted from read responses. Their connection tests perform no payment and send no test email.
- Razorpay webhook: `https://ir.vishwalabs.com/api/commerce/webhook/razorpay`; use the panel's separate webhook secret and captured-payment events.

Back up MySQL and private uploads before migrations. Build and test in a separate release directory. Keep `.well-known` available for CloudPanel certificate renewal. Run fixture-driven authoring/payment tests only against the isolated test database; the live catalogue must contain only actual centre courses.
