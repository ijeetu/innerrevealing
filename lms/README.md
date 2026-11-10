# Inner Revealing web LMS

The web LMS runs at https://ir.vishwalabs.com. Administrator sign-in is at https://ir.vishwalabs.com/admin/login. The separate marketing website remains in the repository root. This package does not deploy a mobile app or use Firebase.

## Run and deploy

Configure `.env` from `.env.example` with local MySQL credentials and a stable random `APP_ENCRYPTION_KEY` (`openssl rand -hex 32`). Credentials and uploaded files stay outside Git.

```sh
npm ci
npm run db:migrate
npm run dev
# Production:
npm run build
PORT=8010 npm start
```

Production binds to localhost behind Nginx. See [server instructions](deploy/README.md) for the service, paths, backups and update process.

## Centre administration

Superadmins and admins can manage real courses and curriculum, upload images/video/audio/PDFs, publish or archive courses, manage people and enrolments, review manual payments, and edit pages, FAQs, contact enquiries and centre settings. Superadmins manage top-level roles and encrypted payment/email integrations. Activity is recorded in the audit log; the last active superadmin is protected.

Create the first superadmin only through the explicit server CLI. Set `BOOTSTRAP_EMAIL`, `BOOTSTRAP_NAME` and a unique `BOOTSTRAP_PASSWORD` (16–128 characters), then run `npm run admin:bootstrap`. There are no default credentials or seeded learner accounts. Existing account promotion/password rotation requires the explicit flags documented by the bootstrap script.

Courses remain empty until the centre adds real content. Publishing requires complete course information, a thumbnail, an active author/category/language, and at least one complete published lesson. Uploaded lesson media is stored at `UPLOAD_DIR` outside the public web root and served only to authorised learners or as an explicit preview.

## Learning and payments

Learners can register/sign in, save practices, join free courses, use the cart for paid courses, resume lessons, track completion, and view their purchases and in-site updates. MySQL stores accounts, hashed sessions, courses, orders, enrolments, progress and notifications. Old demo cache is discarded; there is no vendor API fallback.

Manual payments require an actual payment reference and administrator verification before access is granted. Configure payment instructions, UPI/bank details and optional Razorpay keys in **Admin → Integrations**. Online payments grant access only after server-side signature and captured-payment checks. Razorpay webhooks use `/api/commerce/webhook/razorpay` with a separately configured webhook secret. See [Razorpay's integration documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) for provider setup.

Configure SMTP in the same integrations panel for password-reset emails. Admins can also generate a one-time, 30-minute reset link and share it through the user's chosen channel. Connection-test buttons verify saved settings without sending a test message or creating a payment. Unconfigured providers are hidden from learner checkout rather than simulated.

## Verification

```sh
npx tsc --noEmit --incremental false
npm run test:backend
npm run test:admin
npm run test:learning
npm run test:services
npm run build
```

Admin/learning HTTP suites require `IR_TEST_ALLOW_FIXTURES=1`, an isolated database whose name contains `test`, exact `IR_TEST_EXPECT_DB`, `IR_TEST_BASE_URL`, `IR_TEST_ORIGIN` and test-superadmin credentials. They verify the database name before creating fixtures and refuse production. Keep test courses out of the live database.
