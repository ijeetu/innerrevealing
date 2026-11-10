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
npm run build
# Run as root after a successful build:
systemctl restart innerrevealing-lms
systemctl status innerrevealing-lms --no-pager
```

Run dependency installation and builds as the site user. Keep the previous release or a backup before updating source. Logs are available with `journalctl -u innerrevealing-lms`.

## Backend handoff

The supplied package contains no LMS backend. The initial web deployment uses the supplied vendor demo API at `https://elms.wrteam.me/api`. Its content, settings and available authentication methods are controlled by the vendor; this is not an Inner Revealing course database. Supply the actual eLMS backend URL and Firebase web configuration before accepting real learners, payments or course data.

Update `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_END_POINT`, and the Firebase variables, authorize `ir.vishwalabs.com` in the Firebase project, and allow this origin in backend CORS settings. Firebase sign-in and push notifications remain unavailable while their configuration is absent. Verify course listing, sign-in, enrolment and payments against the actual backend after rebuilding.

## Checks

```sh
curl -I http://127.0.0.1:8010
curl -I https://ir.vishwalabs.com
systemctl is-enabled innerrevealing-lms
```

Check the homepage and `/courses` in a browser, including browser network requests. TLS certificate renewal is managed by CloudPanel.
