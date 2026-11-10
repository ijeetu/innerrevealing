const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const enabled = process.env.IR_TEST_ALLOW_FIXTURES === '1';

test('isolated HTTP: enrolment, private media, progress, wishlist, order ownership and manual approval', { skip: !enabled, timeout: 180000 }, async () => {
  for (const name of ['IR_TEST_BASE_URL', 'IR_TEST_EXPECT_DB', 'IR_TEST_ADMIN_EMAIL', 'IR_TEST_ADMIN_PASSWORD']) assert.ok(process.env[name], `${name} is required`);
  assert.match(process.env.IR_TEST_EXPECT_DB, /test/i, 'Fixture database name must contain test');
  const base = new URL(process.env.IR_TEST_BASE_URL).origin;
  const origin = process.env.IR_TEST_ORIGIN || base;
  const token = randomUUID().replace(/-/g, '');
  function client() {
    let cookie = '';
    return {
      async send(path, method = 'GET', body) {
        const form = body instanceof FormData;
        const response = await fetch(`${base}/api/${path}`, {
          method, redirect: 'error', signal: AbortSignal.timeout(20000),
          headers: { Accept: 'application/json', ...(cookie ? { cookie } : {}), ...(method !== 'GET' ? { origin, ...(!form ? { 'content-type': 'application/json' } : {}) } : {}) },
          ...(body !== undefined ? { body: form ? body : JSON.stringify(body) } : {}),
        });
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) cookie = setCookie.split(';')[0];
        const json = response.headers.get('content-type')?.includes('application/json');
        return { status: response.status, headers: response.headers, ...(json ? { result: await response.json() } : { bytes: Buffer.from(await response.arrayBuffer()) }) };
      },
      async ok(path, method = 'GET', body) {
        const value = await this.send(path, method, body);
        assert.ok(value.status >= 200 && value.status < 300, `${method} ${path}: ${value.status} ${value.result?.message || ''}`);
        assert.equal(value.result?.error, false, `${path} should return a successful API envelope`);
        return value.result.data;
      },
    };
  }
  const admin = client(), first = client(), second = client(), guest = client();
  const courses = [];
  await admin.ok('auth/login', 'POST', { email: process.env.IR_TEST_ADMIN_EMAIL, password: process.env.IR_TEST_ADMIN_PASSWORD });
  const system = await admin.ok('admin/system-status');
  assert.equal(system.database_name, process.env.IR_TEST_EXPECT_DB, 'Fixtures must never run against another database');
  assert.match(system.database_name, /test/i);
  const categories = await guest.ok('categories?per_page=20');
  const languages = await guest.ok('get-course-languages');
  assert.ok(categories.data[0]?.id && languages[0]?.id, 'Real site taxonomy is required');
  const password = `Learning-${token}!`;
  const one = await first.ok('auth/register', 'POST', { name: 'Isolated learner one', email: `learning-one-${token}@example.invalid`, password });
  await second.ok('auth/register', 'POST', { name: 'Isolated learner two', email: `learning-two-${token}@example.invalid`, password });
  const privateText = `Private lesson access verification ${token}`;
  const pdfBytes = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%Private fixture ${token}\n%%EOF\n`);
  let uploaded;
  try {
    const form = new FormData(); form.set('purpose', 'course'); form.set('file', new File([pdfBytes], 'isolated-private.pdf', { type: 'application/pdf' }));
    uploaded = await admin.ok('admin/media', 'POST', form);
    const create = async (suffix, price) => {
      const course = await admin.ok('admin/courses', 'POST', { title: `Isolated learning verification ${suffix}`, slug: `isolated-learning-${token}-${suffix}`, short_description: 'Temporary isolated database verification.', description: '<p>This disposable record validates the learning workflow.</p>', image: '/inner-revealing-logo.png', category_id: categories.data[0].id, language_id: languages[0].id, price, status: 'draft' });
      courses.push(course.id);
      const chapter = await admin.ok(`admin/courses/${course.id}/chapters`, 'POST', { title: 'Verification chapter', position: 0 });
      const preview = await admin.ok(`admin/chapters/${chapter.id}/lessons`, 'POST', { title: 'Public preview', type: 'text', content: '<p>This preview is intentionally public.</p>', is_preview: true, is_published: true, position: 0 });
      const privateLesson = await admin.ok(`admin/chapters/${chapter.id}/lessons`, 'POST', { title: 'Protected practice', type: 'text', content: `<p>${privateText}</p>`, is_preview: false, is_published: true, position: 1 });
      let document;
      if (price === 0) document = await admin.ok(`admin/chapters/${chapter.id}/lessons`, 'POST', { title: 'Protected document', type: 'pdf', media_id: uploaded.id, is_preview: false, is_published: true, position: 2 });
      await admin.ok(`admin/chapters/${chapter.id}/lessons`, 'POST', { title: 'Hidden draft lesson', type: 'text', content: 'Not published', is_preview: false, is_published: false, position: 3 });
      await admin.ok(`admin/courses/${course.id}`, 'PATCH', { status: 'published' });
      return { course, chapter, preview, privateLesson, document };
    };
    const free = await create('free', 0), paid = await create('paid', 123.45);
    const publicOverview = await guest.ok(`learning/course/${free.course.slug}`);
    const serialized = JSON.stringify(publicOverview);
    assert.ok(!serialized.includes(privateText));
    assert.ok(!serialized.includes(`/api/media/${uploaded.id}`));
    assert.ok(!serialized.includes('Hidden draft lesson'));
    assert.equal(publicOverview.enrolled, false);
    assert.equal((await guest.send(`learning/lesson/${free.privateLesson.id}`)).status, 401);
    assert.equal((await guest.send(`learning/progress/${free.privateLesson.id}`, 'POST', { completed: true })).status, 401);
    assert.equal((await first.send(`learning/lesson/${free.privateLesson.id}`)).status, 403);
    assert.equal((await first.send(`learning/progress/${free.preview.id}`, 'POST', { completed: true })).status, 403);
    assert.equal((await guest.send(`learning/lesson/${free.preview.id}`)).status, 200);
    assert.ok([401, 403].includes((await guest.send(`media/${uploaded.id}`)).status));
    assert.equal((await first.send(`media/${uploaded.id}`)).status, 403);
    await first.ok(`learning/wishlist/${free.course.id}`, 'POST', { saved: true });
    assert.ok((await first.ok('learning/wishlist')).some(item => item.id === free.course.id));
    assert.deepEqual(await second.ok('learning/wishlist'), []);
    const freeOrder = await first.ok('commerce/orders', 'POST', { course_ids: [free.course.id], payment_method: 'free' });
    assert.equal(freeOrder.order.status, 'paid');
    assert.ok((await first.ok(`learning/lesson/${free.privateLesson.id}`)).content.includes(privateText));
    const media = await first.send(`media/${uploaded.id}`);
    assert.equal(media.status, 200); assert.match(media.headers.get('content-type'), /application\/pdf/); assert.deepEqual(media.bytes, pdfBytes);
    await first.ok(`learning/progress/${free.privateLesson.id}`, 'POST', { completed: true, position_seconds: 25 });
    const progress = await first.ok(`learning/lesson/${free.privateLesson.id}`);
    assert.equal(progress.completed, true); assert.equal(progress.position_seconds, 25);
    await first.ok(`learning/progress/${free.privateLesson.id}`, 'POST', { position_seconds: 30 });
    assert.equal((await first.ok(`learning/lesson/${free.privateLesson.id}`)).completed, true, 'Playback autosave must preserve a completed lesson');
    assert.equal((await first.send(`learning/progress/${free.privateLesson.id}`, 'POST', { completed: 'true' })).status, 422);
    const library = await first.ok('learning/library');
    assert.equal(library.find(item => item.course.id === free.course.id).completed_lessons, 1);
    assert.equal((await second.send(`learning/lesson/${free.privateLesson.id}`)).status, 403);
    assert.equal((await second.send(`learning/progress/${free.privateLesson.id}`, 'POST', { completed: true })).status, 403);
    assert.equal((await second.send(`media/${uploaded.id}`)).status, 403);
    const manual = await first.ok('commerce/orders', 'POST', { course_ids: [paid.course.id], payment_method: 'manual' });
    assert.equal(manual.order.status, 'pending');
    assert.equal((await first.send(`learning/lesson/${paid.privateLesson.id}`)).status, 403);
    assert.equal((await second.send(`commerce/orders/${manual.order.id}`)).status, 404);
    const forged = await first.send(`commerce/orders/${manual.order.id}/verify`, 'POST', { razorpay_order_id: 'order_forged', razorpay_payment_id: 'pay_forged', razorpay_signature: '0'.repeat(64) });
    assert.ok(forged.status >= 400, 'A forged provider response must not grant access');
    assert.equal((await first.send(`learning/lesson/${paid.privateLesson.id}`)).status, 403);
    await first.ok(`commerce/orders/${manual.order.id}/manual`, 'POST', { reference: `ISOLATED-${token}`, notes: 'No money moved. Isolated approval workflow verification.' });
    assert.equal((await first.ok(`commerce/orders/${manual.order.id}`)).order.status, 'awaiting_review');
    assert.equal((await first.send(`learning/lesson/${paid.privateLesson.id}`)).status, 403);
    await admin.ok(`admin/orders/${manual.order.id}/approve`, 'POST', {});
    assert.equal((await first.ok(`commerce/orders/${manual.order.id}`)).order.status, 'paid');
    assert.equal((await first.send(`learning/lesson/${paid.privateLesson.id}`)).status, 200);
    const notifications = await first.ok('notifications?per_page=50');
    assert.ok(notifications.data.length > 0, 'Real payment and enrolment changes should create updates');
    const unread = notifications.data.find(item => !item.is_read);
    assert.ok(unread, 'A newly created update must be unread');
    assert.equal((await first.send('notifications/mark-read', 'POST', {})).status, 422);
    const otherMark = await second.ok('notifications/mark-read', 'POST', { notification_id: unread.id });
    assert.equal(otherMark.updated, 0, 'Another learner cannot mark this user update read');
    assert.equal((await first.ok('notifications?per_page=50')).data.find(item => item.id === unread.id).is_read, false);
    await first.ok('notifications/mark-read', 'POST', { notification_id: unread.id });
    assert.equal((await first.ok('notifications?per_page=50')).data.find(item => item.id === unread.id).is_read, true);
    await first.ok('notifications/mark-all-read', 'POST', {});
    assert.equal((await first.ok('notifications?per_page=50')).unread_count, 0);
    const memberships = await admin.ok(`admin/enrollments?user_id=${one.user.id}&per_page=100`);
    const membership = memberships.items.find(item => Number(item.user_id) === one.user.id && Number(item.course_id) === free.course.id);
    assert.ok(membership, 'The free enrolment should be stored');
    await admin.ok(`admin/enrollments/${membership.id}`, 'DELETE', {});
    assert.equal((await first.send(`learning/lesson/${free.privateLesson.id}`)).status, 403);
    assert.equal((await first.send(`learning/progress/${free.privateLesson.id}`, 'POST', { completed: true })).status, 403);
    assert.equal((await first.send(`media/${uploaded.id}`)).status, 403);
    assert.equal((await guest.send(`learning/lesson/${free.preview.id}`)).status, 200);
    assert.equal((await first.send('commerce/orders', 'POST', { course_ids: [free.course.id], payment_method: 'free' })).status, 403, 'Revoked access cannot be bypassed by joining the free course again');
    assert.equal((await first.send('commerce/cart', 'POST', { course_id: free.course.id })).status, 403);
    await first.ok(`learning/wishlist/${free.course.id}`, 'POST', { saved: false });
    assert.deepEqual(await first.ok('learning/wishlist'), []);
  } finally {
    // Financial history intentionally remains only in the disposable test database.
    for (const id of courses) await admin.send(`admin/courses/${id}`, 'PATCH', { status: 'archived' }).catch(() => {});
    await first.send('auth/account', 'DELETE', { password }).catch(() => {});
    await second.send('auth/account', 'DELETE', { password }).catch(() => {});
    await admin.send('auth/logout', 'POST', {}).catch(() => {});
  }
});
