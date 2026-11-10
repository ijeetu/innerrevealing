const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const ts = require('typescript');

function loadSource(filename, mocks = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(process.cwd(), filename), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }, fileName: filename,
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require(id) {
    if (Object.prototype.hasOwnProperty.call(mocks, id)) return mocks[id];
    throw new Error(`Unexpected import in ${filename}: ${id}`);
  }, console, URL, URLSearchParams, Date, Intl, FormData, File, Blob, AbortController, Error, setTimeout, clearTimeout });
  return module.exports;
}
const routes = loadSource('src/utils/apiRoutes.ts');
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
const chart = loadSource('src/server/instructor/dashboard.ts', {
  '../authorization': {}, '../db': {}, '../errors': { ApiError }, '../catalogue': {}, '../response': {}, './support': {},
});
const staff = loadSource('src/components/instructor/Layout/staffAccess.ts');
const unwrap = value => JSON.parse(JSON.stringify(value));
function wrapper(filename, client) {
  const axios = { __esModule: true, default: client };
  return loadSource(filename, {
    '@/utils/apiRoutes': routes, '@/utils/api/axiosClient': axios, '../../../axiosClient': axios, '../../axiosClient': axios,
    '@/utils/helpers': { extractApiErrorMessage: failure => ({ message: failure.message || 'Failed', statusCode: 500 }) },
  });
}

test('staff access depends on SQL account role, and login returns cannot leave this website', () => {
  assert.equal(staff.staffRole({ role: 'admin' }), 'admin');
  assert.equal(staff.staffRole({ role: 'superadmin' }), 'superadmin');
  assert.equal(staff.staffRole({ role: 'student', is_instructor: true }), null);
  assert.equal(staff.staffRole(null), null);
  assert.equal(staff.staffLoginDestination('/admin/integrations?section=smtp'), '/admin/integrations?section=smtp');
  for (const target of [null, 'https://example.invalid/admin', '//example.invalid/admin', 'javascript:alert(1)', '/admin/login', '/admin/../', '/admin\\example.invalid']) {
    assert.equal(staff.staffLoginDestination(target), '/instructor/dashboard');
  }
});

test('sales charts use real receipts, net refund values, Kolkata dates, and no future buckets', () => {
  const result = unwrap(chart.buildSalesStatistics([
    { day: '2025-12-29', sales: 1, revenue: '100', profit: '50' },
    { day: '2026-01-01', sales: 2, revenue: '300.20', profit: '200.10' },
    { day: '2026-01-02', sales: 99, revenue: '9999', profit: '9999' },
  ], new Date('2026-01-01T00:30:00+05:30')));
  assert.deepEqual(result.yearly, [{ name: 'Jan', sales: 2, revenue: 300.2, profit: 200.1 }]);
  assert.deepEqual(result.monthly, [{ name: '1', sales: 2, revenue: 300.2, profit: 200.1 }]);
  assert.equal(result.weekly.length, 4);
  assert.equal(result.weekly[0].sales, 1);
  assert.equal(result.weekly[3].sales, 2);
  assert.deepEqual(unwrap(chart.buildSalesStatistics([], new Date('2026-01-01T00:30:00+05:30'))), { yearly: [], monthly: [], weekly: [] });
});

test('original category and curriculum-order wrappers accept local SQL API contracts without environment gates', async () => {
  const categories = wrapper('src/utils/api/instructor/course/getCategories.ts', { get: async () => ({ data: { error: false, message: 'ok', code: 200, data: { data: [{ id: 7, name: 'Meditation' }] } } }) });
  const result = await categories.getCategories();
  assert.equal(Array.isArray(result.data), true);
  assert.equal(result.data[0].id, 7);
  let captured;
  const order = wrapper('src/utils/api/instructor/createCourseApis/create-course/updateCurriculumOrder.ts', { put: async (url) => { captured = url; return { data: { error: false, data: {}, message: 'saved' } }; } });
  assert.equal((await order.updateCurriculumOrderByIds(4, [101, 9, 103])).success, true);
  const url = new URL(captured, 'https://innerrevealing.invalid');
  assert.equal(url.searchParams.get('chapter_id'), '4');
  assert.deepEqual(url.searchParams.getAll('ids[]'), ['101', '9', '103']);
});

test('lecture upload reports saved protected media only after success and enforces the 50 MB limit', async () => {
  const calls = [], progress = [];
  const upload = wrapper('src/utils/api/instructor/createCourseApis/create-course/chunkedUpload.ts', { post: async (url, body, options) => {
    calls.push({ url, body }); options.onUploadProgress({ loaded: 4 });
    assert.notEqual(progress.at(-1).status, 'completed');
    return { data: { error: false, data: { id: 37 } } };
  } });
  const result = await upload.uploadFileInChunks(new File(['test'], 'practice.mp4', { type: 'video/mp4' }), value => progress.push(value));
  assert.equal(result.videoName, 'media:37');
  assert.equal(calls[0].url, '/admin/media');
  assert.equal(calls[0].body.get('purpose'), 'course');
  assert.equal(progress.at(-1).status, 'completed');
  assert.match((await upload.uploadFileInChunks({ size: 51 * 1024 * 1024 })).error, /50 MB/);
  const controller = new AbortController(); controller.abort();
  assert.equal((await upload.uploadFileInChunks(new File(['test'], 'practice.mp4'), undefined, undefined, controller.signal)).cancelled, true);
  assert.equal(calls.length, 1);
});

test('original lecture and resource editors pass the entity ID expected by the SQL adapter', async () => {
  for (const [filename, field, fn] of [
    ['editLecture.ts', 'lecture_type_id', 'updateLecture'], ['editResource.ts', 'document_type_id', 'updateResource'],
  ]) {
    let submitted;
    const api = wrapper(`src/utils/api/instructor/editCourse/${filename}`, { post: async (_url, body) => { submitted = body; return { data: { error: false, data: {}, message: 'saved' } }; } });
    const body = new FormData(); body.set(field, '73'); body.set('chapter_id', '8'); body.set('type', field === 'lecture_type_id' ? 'lecture' : 'document');
    const result = await api[fn](body);
    assert.equal(result.success, true);
    assert.equal(submitted.get('id'), '73');
    assert.equal(submitted.get(field), '73');
  }
});

test('course create and update preserve explicit empty lists so removed values stay removed', async () => {
  for (const [filename, method] of [
    ['src/utils/api/instructor/createCourseApis/create-course/createCourse.ts', 'createCourse'],
    ['src/utils/api/instructor/course/delete-update-course/updateCourse.ts', 'updateCourse'],
  ]) {
    let submitted;
    const api = wrapper(filename, { post: async (_url, body) => { submitted = body; return { data: { error: false, data: {}, message: 'saved' } }; } });
    const body = new FormData();
    for (const field of ['course_tags', 'learnings_data', 'requirements_data', 'instructors']) body.set(field, '[]');
    const result = method === 'createCourse' ? await api.createCourse(body) : await api.updateCourse(73, body);
    assert.equal(result.success, true);
    for (const field of ['course_tags', 'learnings_data', 'requirements_data', 'instructors']) assert.equal(submitted.get(field), '[]');
    assert.equal(submitted.has('instructors[0]'), false);
  }
});

const expectedDatabase = process.env.IR_TEST_EXPECT_DB || '';
const canSmoke = Boolean(process.env.IR_TEST_BASE_URL && process.env.IR_TEST_ADMIN_EMAIL && process.env.IR_TEST_ADMIN_PASSWORD && process.env.IR_TEST_ALLOW_FIXTURES === '1' && /test/i.test(expectedDatabase));
test('HTTP: original course wizard creates, edits and reorders real private curriculum, then cleans up', { skip: !canSmoke }, async () => {
  const base = new URL(process.env.IR_TEST_BASE_URL).origin;
  const origin = process.env.IR_TEST_ORIGIN || base;
  let cookie = '', courseId;
  const send = async (endpoint, method = 'GET', body) => {
    const multipart = body instanceof FormData;
    const response = await fetch(`${base}/api/${endpoint}`, { method, redirect: 'error', headers: {
      ...(method !== 'GET' ? { origin } : {}), ...(body && !multipart ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}),
    }, ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}) });
    const setCookie = response.headers.get('set-cookie'); if (setCookie) cookie = setCookie.split(';')[0];
    return { response, payload: await response.json() };
  };
  const form = values => { const body = new FormData(); for (const [key, value] of Object.entries(values)) body.set(key, String(value)); return body; };
  try {
    let result = await send('get-instructor-dashboard'); assert.equal(result.response.status, 401);
    result = await send('auth/login', 'POST', { email: process.env.IR_TEST_ADMIN_EMAIL, password: process.env.IR_TEST_ADMIN_PASSWORD });
    assert.equal(result.response.status, 200); assert.ok(['admin', 'superadmin'].includes(result.payload.data.user.role));
    result = await send('admin/system-status');
    assert.equal(result.response.status, 200, 'Fixture guard requires a superadmin and the isolated database status endpoint.');
    assert.equal(result.payload.data.database_name, expectedDatabase, 'Fixture guard: actual database must exactly match IR_TEST_EXPECT_DB before creating any course.');
    const category = (await send('admin/categories?per_page=50')).payload.data.items.find(item => item.is_active);
    const language = (await send('admin/languages?per_page=50')).payload.data.items.find(item => item.is_active);
    assert.ok(category && language, 'Database needs an active category and teaching language.');
    const suffix = randomUUID(), title = `Private wizard verification ${suffix}`, tagName = `Wizard verification ${suffix}`;
    const metadata = { description: 'Private course description retained through updates.', meta_title: 'Private verification search title', meta_description: 'Private verification search description', meta_tags: 'meditation,private-verification', sequential_access: 1, certificate_enabled: 1, certificate_fee: 99 };
    result = await send('create-course', 'POST', form({ title, short_description: 'Temporary private verification, removed by this test.', ...metadata, level: 'beginner', course_type: 'paid', price: 1200, discount_price: 800, category_id: category.id, language_id: language.id, status: 'draft', is_active: 1, 'course_tags[0]': `new__${tagName}`, 'learnings_data[0][learning]': 'A private learning objective.', 'requirements_data[0][requirement]': 'A private course requirement.', instructors: '[]' }));
    assert.equal(result.response.status, 200, result.payload.message); courseId = Number(result.payload.data.id); assert.ok(courseId > 0);
    const details = async () => {
      const fetched = await send(`get-course-details?id=${courseId}`);
      assert.equal(fetched.response.status, 200, fetched.payload.message);
      assert.equal(Number(fetched.payload.data.course_details.id), courseId);
      return fetched.payload.data.course_details;
    };
    const listed = async (type) => {
      const query = new URLSearchParams({ search: title, per_page: '50', ...(type ? { course_type: type } : {}) });
      const fetched = await send(`get-added-courses?${query}`);
      assert.equal(fetched.response.status, 200, fetched.payload.message);
      assert.ok(Number(fetched.payload.data.statistics.total_courses) >= 1);
      return fetched.payload.data.courses;
    };
    let detail = await details();
    for (const field of ['description', 'meta_title', 'meta_description', 'meta_tags']) assert.equal(detail[field], metadata[field], `Metadata must roundtrip: ${field}`);
    assert.equal(detail.sequential_access, true); assert.equal(detail.certificate_enabled, true); assert.equal(Number(detail.certificate_fee), 99);
    assert.equal(detail.course_type, 'paid'); assert.equal(Number(detail.price), 1200); assert.equal(Number(detail.discounted_price), 800);
    assert.equal(detail.learnings.length, 1); assert.equal(detail.learnings[0].title, 'A private learning objective.'); assert.ok(Number(detail.learnings[0].id) > 0);
    assert.equal(detail.requirements.length, 1); assert.equal(detail.requirements[0].requirement, 'A private course requirement.'); assert.ok(Number(detail.requirements[0].id) > 0);
    assert.deepEqual(detail.co_instructors, [], 'A course without accepted assigned staff must not fabricate co-instructors.');
    assert.equal(detail.tags.length, 1); assert.equal(detail.tags[0].name, tagName); assert.ok(Number.isSafeInteger(Number(detail.tags[0].id)) && Number(detail.tags[0].id) > 0);
    result = await send('get-tags'); assert.equal(result.response.status, 200);
    const storedTag = result.payload.data.find(tag => tag.name === tagName);
    assert.ok(storedTag); assert.equal(Number(storedTag.id), Number(detail.tags[0].id), 'Editor detail IDs must match the shared tag selector IDs.'); assert.equal(storedTag.tag, tagName);
    let courses = await listed('paid'); assert.equal(courses.total, 1);
    let listedCourse = courses.data[0]; assert.equal(Number(listedCourse.id), courseId); assert.equal(Number(listedCourse.price), 1200); assert.equal(Number(listedCourse.discounted_price), 800); assert.equal(Number(listedCourse.discount_price), 800); assert.equal(listedCourse.course_type, 'paid');
    for (const field of ['total_chapter_count', 'total_lesson_count', 'total_enrolled_students', 'rating_count', 'total_revenue', 'revenue']) assert.equal(Number(listedCourse[field]), 0, `A new course has no ${field}.`);
    assert.equal((await listed('free')).total, 0, 'Paid courses must not appear in the free filter.');
    result = await send('create-course-chapter', 'POST', form({ course_id: courseId, title: 'Private test chapter', description: 'Removed after verification.', is_active: 1 }));
    assert.equal(result.response.status, 200, result.payload.message); const chapterId = Number(result.payload.data.id);
    result = await send('course-chapters/curriculum', 'POST', form({ chapter_id: chapterId, type: 'lecture', lecture_title: 'Private verification lecture', lecture_type: 'youtube_url', lecture_youtube_url: 'https://example.invalid/private-verification.mp4', lecture_hours: 0, lecture_minutes: 1, lecture_seconds: 0, resource_status: 1, 'resource_data[0][resource_type]': 'url', 'resource_data[0][resource_title]': 'Private verification resource', 'resource_data[0][resource_url]': 'https://example.invalid/private-notes.pdf' }));
    assert.equal(result.response.status, 200, result.payload.message);
    assert.equal(result.payload.data.resources.length, 1);
    result = await send('course-chapters/curriculum', 'POST', form({ chapter_id: chapterId, type: 'quiz', quiz_title: 'Private verification quiz', quiz_total_points: 10, quiz_passing_score: 5, quiz_can_skip: 0 }));
    assert.equal(result.response.status, 200, result.payload.message);
    result = await send(`course-chapters/curriculum/list?chapter_id=${chapterId}`);
    assert.equal(result.response.status, 200); const rows = result.payload.rows; assert.equal(rows.length, 2); assert.equal(new Set(rows.map(item => item.lesson_id)).size, 2);
    const order = new URLSearchParams({ chapter_id: String(chapterId) }); rows.slice().reverse().forEach(item => order.append('ids[]', String(item.lesson_id)));
    result = await send(`course-chapters/curriculum/update-order?${order}`, 'PUT', {}); assert.equal(result.response.status, 200, result.payload.message);
    result = await send(`course-chapters/curriculum/list?chapter_id=${chapterId}`); assert.deepEqual(result.payload.rows.map(item => item.lesson_id), rows.slice().reverse().map(item => item.lesson_id));
    const lecture = rows.find(item => item.type === 'lecture');
    result = await send('course-chapters/curriculum/lecture/update', 'POST', form({ _method: 'PUT', lecture_type_id: lecture.id, id: lecture.id, chapter_id: chapterId, type: 'lecture', lecture_title: 'Updated private verification lecture', lecture_type: 'youtube_url', lecture_youtube_url: 'https://example.invalid/private-verification.mp4', resource_status: 0 }));
    assert.equal(result.response.status, 200, result.payload.message);
    assert.deepEqual(result.payload.data.resources, [], 'Removing the last lecture resource must delete the saved resource.');
    result = await send('course-chapters/curriculum', 'POST', form({ chapter_id: chapterId, type: 'document', document_title: 'Private verification document', document_type: 'url', document_url: 'https://example.invalid/private-verification.pdf', document_duration: 120 }));
    assert.equal(result.response.status, 200, result.payload.message); assert.equal(Number(result.payload.data.duration_seconds), 120); assert.equal(result.payload.data.formatted_duration, '00:02:00');
    detail = await details(); assert.equal(detail.chapters.length, 1); assert.equal(detail.chapters[0].lectures.length, 1); assert.equal(detail.chapters[0].quizzes.length, 1); assert.equal(detail.chapters[0].resources.length, 1); assert.equal(Number(detail.chapters[0].resources[0].duration_seconds), 120);
    courses = await listed('paid'); assert.equal(courses.total, 1); listedCourse = courses.data[0]; assert.equal(Number(listedCourse.total_chapter_count), 1); assert.equal(Number(listedCourse.total_lesson_count), 3);
    for (const field of ['total_enrolled_students', 'rating_count', 'total_revenue', 'revenue']) assert.equal(Number(listedCourse[field]), 0, `Private curriculum must not fabricate ${field}.`);
    // These are the exact raw keys used when the original wizard clears every selected list.
    result = await send('update-course', 'POST', form({ id: courseId, _method: 'PUT', course_type: 'free', price: 0, discount_price: '', course_tags: '[]', learnings_data: '[]', requirements_data: '[]', instructors: '[]', sequential_access: 0, certificate_enabled: 0, certificate_fee: 0 }));
    assert.equal(result.response.status, 200, result.payload.message);
    detail = await details();
    for (const field of ['tags', 'learnings', 'requirements', 'co_instructors']) assert.deepEqual(detail[field], [], `Saving a cleared ${field} must remove the saved values.`);
    for (const field of ['description', 'meta_title', 'meta_description', 'meta_tags']) assert.equal(detail[field], metadata[field], `Unchanged metadata must survive list clearing: ${field}`);
    assert.equal(detail.sequential_access, false); assert.equal(detail.certificate_enabled, false); assert.equal(Number(detail.certificate_fee), 0);
    assert.equal(detail.course_type, 'free'); assert.equal(Number(detail.price), 0); assert.equal(Number(detail.discounted_price), 0);
    courses = await listed('free'); assert.equal(courses.total, 1); assert.equal(Number(courses.data[0].price), 0); assert.equal(Number(courses.data[0].discounted_price), 0); assert.equal(courses.data[0].course_type, 'free');
    assert.equal((await listed('paid')).total, 0, 'Clearing a paid price must move the course out of the paid filter.');
    result = await send('update-course-status', 'POST', form({ course_id: courseId, status: 'publish', certificate_enabled: 0 }));
    assert.equal(result.response.status, 422, 'Incomplete test course must stay private.');
    result = await send('get-instructor-dashboard'); assert.equal(result.response.status, 200); assert.ok(result.payload.data.overview_stats); assert.ok(Array.isArray(result.payload.data.sales_statistics.weekly));
  } finally {
    if (courseId) { const removed = await send(`admin/courses/${courseId}`, 'DELETE'); assert.equal(removed.response.status, 200, 'Temporary private course cleanup failed.'); }
  }
});
