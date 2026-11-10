const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const compiled = process.env.IR_BACKEND_COMPILED;
if (!compiled) throw new Error('Run node scripts/test-backend.cjs');
const { hashPassword, verifyPassword } = require(path.join(compiled, 'passwords.js'));
const { assertSameOrigin, normalizeEmail, validateName, validatePassword, readJson } = require(path.join(compiled, 'request.js'));

test('password hashes use random salts and reject incorrect or malformed credentials', async () => {
  const first = await hashPassword('correct horse battery staple');
  const second = await hashPassword('correct horse battery staple');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse battery staple', first), true);
  assert.equal(await verifyPassword('wrong horse battery staple', first), false);
  assert.equal(await verifyPassword('anything', 'scrypt$999999999$8$1$bad$bad'), false);
});

test('auth validation normalizes email and rejects invalid names and passwords', () => {
  assert.equal(normalizeEmail('  Learner@Example.com '), 'learner@example.com');
  assert.equal(validateName('  A Learner  '), 'A Learner');
  assert.throws(() => normalizeEmail('no-email'));
  assert.throws(() => validateName('line\nbreak'));
  assert.throws(() => validatePassword('short'));
  assert.throws(() => validatePassword('x'.repeat(129)));
  assert.equal(validatePassword('a long enough password'), 'a long enough password');
});

test('mutations require this site origin and reject cross-site fetches', () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = 'https://ir.vishwalabs.com';
  try {
    assert.doesNotThrow(() => assertSameOrigin(new Request('https://ir.vishwalabs.com/api/auth/login', { headers: { origin: 'https://ir.vishwalabs.com' } })));
    assert.throws(() => assertSameOrigin(new Request('https://ir.vishwalabs.com/api/auth/login', { headers: { origin: 'https://evil.example' } })));
    assert.throws(() => assertSameOrigin(new Request('https://ir.vishwalabs.com/api/auth/login')));
    assert.throws(() => assertSameOrigin(new Request('https://ir.vishwalabs.com/api/auth/login', { headers: { origin: 'https://ir.vishwalabs.com', 'sec-fetch-site': 'cross-site' } })));
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test('JSON parser rejects non-objects, wrong media type, and oversized bodies', async () => {
  const request = body => new Request('https://ir.vishwalabs.com/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  assert.deepEqual(await readJson(request('{"email":"a@example.com"}')), { email: 'a@example.com' });
  await assert.rejects(readJson(request('[]')), error => error.status === 400);
  await assert.rejects(readJson(request('invalid json')), error => error.status === 400);
  await assert.rejects(readJson(request(JSON.stringify({ text: 'x'.repeat(17000) }))), error => error.status === 413);
  await assert.rejects(readJson(new Request('https://ir.vishwalabs.com/api/auth/login', { method: 'POST', body: 'email=a' })), error => error.status === 415);
});

test('HTTP integration: MySQL auth, session revocation, CSRF, and an empty local catalogue', { skip: !process.env.IR_TEST_BASE_URL }, async () => {
  const base = new URL(process.env.IR_TEST_BASE_URL).origin;
  const siteOrigin = process.env.IR_TEST_ORIGIN || base;
  const email = `backend-test-${randomUUID()}@example.invalid`;
  let password = `Test-${randomUUID()}!`;
  let cookie = '';
  let created = false;
  const send = async (endpoint, method = 'GET', body, origin = siteOrigin) => {
    const response = await fetch(`${base}/api/${endpoint}`, {
      method, redirect: 'error', headers: { ...(method !== 'GET' ? { origin, 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return { response, data: await response.json(), setCookie };
  };
  try {
    let result = await send('auth/register', 'POST', { name: 'Temporary backend verification', email, password, role: 'admin' });
    assert.equal(result.response.status, 201);
    created = true;
    assert.equal(result.data.data.user.role, 'student');
    assert.equal(result.data.data.user.is_instructor, false);
    assert.match(result.setCookie, /HttpOnly/i);
    assert.match(result.setCookie, /SameSite=Lax/i);
    if (siteOrigin.startsWith('https:')) assert.match(result.setCookie, /Secure/i);
    const firstCookie = cookie;
    result = await send('auth/session');
    assert.equal(result.data.data.user.email, email);
    result = await send('auth/profile', 'POST', { name: 'Updated verification learner' });
    assert.equal(result.data.data.user.name, 'Updated verification learner');
    result = await send('auth/profile', 'POST', { name: 'Cross site change' }, 'https://evil.example');
    assert.equal(result.response.status, 403);
    result = await send('auth/login', 'POST', { email, password: 'deliberately incorrect password' });
    assert.equal(result.response.status, 401);
    const replacement = `Changed-${randomUUID()}!`;
    result = await send('auth/password', 'POST', { current_password: password, password: replacement, confirm_password: replacement });
    assert.equal(result.response.status, 200);
    password = replacement;
    cookie = firstCookie;
    assert.equal((await send('auth/session')).response.status, 401);
    cookie = '';
    assert.equal((await send('auth/login', 'POST', { email, password })).response.status, 200);
    const loginCookie = cookie;
    assert.equal((await send('auth/logout', 'POST', {})).response.status, 200);
    cookie = loginCookie;
    assert.equal((await send('auth/session')).response.status, 401);
    cookie = '';
    assert.equal((await send('auth/login', 'POST', { email, password })).response.status, 200);
    result = await send('get-courses');
    assert.equal(result.response.status, 200);
    assert.equal(result.data.data.total, 0);
    assert.deepEqual(result.data.data.data, []);
    assert.equal((await send('get-course?slug=nonexistent-course')).response.status, 404);
    assert.equal((await send('create-course', 'POST', { title: 'Must never be created' })).response.status, 403);
    assert.equal((await send('place_order', 'POST', {})).response.status, 503);
    assert.equal((await send('auth/account', 'DELETE', { password })).response.status, 200);
    created = false;
    assert.equal((await send('auth/session')).response.status, 401);
  } finally {
    if (created) {
      cookie = '';
      await send('auth/login', 'POST', { email, password });
      const cleanup = await send('auth/account', 'DELETE', { password });
      assert.equal(cleanup.response.status, 200, 'Disposable integration account must be removed');
    }
  }
});
