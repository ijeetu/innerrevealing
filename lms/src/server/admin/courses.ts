import { RowDataPacket } from 'mysql2/promise';
import { database } from '../db';
import { ApiError } from '../errors';
import {
  AdminActor, adminList, audit, booleanValue, enumValue, getRow, idValue, insertRow, integerValue,
  optionalText, safeContent, safeHttps, searchClause, slugValue, SqlConnection, textValue, transaction, updateRow,
} from './core';

function money(value: unknown): number {
  if (typeof value !== 'string' && typeof value !== 'number') throw new ApiError(422, 'Enter a valid course price.');
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 99999999.99 || Math.abs(number * 100 - Math.round(number * 100)) > 0.00001) throw new ApiError(422, 'Enter a nonnegative price with at most two decimal places.');
  return number;
}

function mapLesson(row: RowDataPacket) {
  return { ...row, content_text: row.content, source_url: row.external_url, is_preview: Boolean(row.is_preview), is_published: Boolean(row.is_published), url: row.media_id ? `/api/media/${row.media_id}` : row.external_url };
}

export async function courseDetail(id: number, connection: SqlConnection = database()) {
  const course = await getRow('ir_courses', id, connection);
  const [chapters] = await connection.execute<RowDataPacket[]>('SELECT * FROM ir_chapters WHERE course_id = ? ORDER BY position,id', [id]);
  const [lessons] = await connection.execute<RowDataPacket[]>('SELECT l.*,m.original_name AS media_name,m.mime_type AS media_mime FROM ir_lessons l LEFT JOIN ir_media m ON m.id=l.media_id WHERE l.course_id = ? ORDER BY l.position,l.id', [id]);
  return { ...course, price: Number(course.price), chapters: chapters.map(chapter => ({ ...chapter, lessons: lessons.filter(lesson => Number(lesson.chapter_id) === Number(chapter.id)).map(mapLesson) })) };
}

async function validateCourseReferences(course: Record<string, unknown>, connection: SqlConnection) {
  if (course.category_id) {
    const category = await getRow('ir_categories', Number(course.category_id), connection, true);
    if (!category.is_active) throw new ApiError(422, 'Choose an active category.');
  }
  if (course.language_id) {
    const language = await getRow('ir_languages', Number(course.language_id), connection, true);
    if (!language.is_active) throw new ApiError(422, 'Choose an active language.');
  }
  if (course.instructor_id) {
    const author = await getRow('ir_users', Number(course.instructor_id), connection, true);
    if (!author.is_active || !['admin','superadmin'].includes(author.role)) throw new ApiError(422, 'The course author must be an active administrator.');
  }
  const image = String(course.image || '');
  if (image.startsWith('/api/media/')) {
    const media = await getRow('ir_media', idValue(image.split('/').pop()), connection);
    if (media.kind !== 'image' || !media.is_public) throw new ApiError(422, 'Choose a public uploaded image for the course thumbnail.');
  }
}

export async function ensureCoursePublishable(courseId: number, connection: SqlConnection) {
  const course = await getRow('ir_courses', courseId, connection);
  if (course.status !== 'published') return;
  if (!course.title?.trim() || !course.slug || !course.description?.replace(/<[^>]+>/g, '').trim() || !course.short_description?.trim() || !course.image || !course.category_id || !course.language_id || !course.instructor_id) throw new ApiError(422, 'Add a title, description, summary, thumbnail, category, language and author before publishing.');
  await validateCourseReferences(course, connection);
  const [lessons] = await connection.execute<RowDataPacket[]>('SELECT l.*,m.kind AS media_kind,m.mime_type AS media_mime,m.byte_size FROM ir_lessons l LEFT JOIN ir_media m ON m.id=l.media_id WHERE l.course_id = ? AND l.is_published = 1', [courseId]);
  if (!lessons.length) throw new ApiError(422, 'Add at least one complete, published lesson before publishing this practice.');
  for (const lesson of lessons) {
    if (!lesson.title?.trim()) throw new ApiError(422, 'Each published lesson needs a title.');
    if (lesson.type === 'text') {
      if (!lesson.content?.replace(/<[^>]+>/g, '').trim()) throw new ApiError(422, 'Each published text lesson needs content.');
    } else if (lesson.media_id) {
      const expected = lesson.type === 'pdf' ? 'document' : lesson.type;
      if (lesson.media_kind !== expected || !Number(lesson.byte_size) || (lesson.type === 'pdf' && lesson.media_mime !== 'application/pdf')) throw new ApiError(422, 'A lesson media file is missing or does not match its type.');
    } else {
      if (!lesson.external_url) throw new ApiError(422, 'Each published media lesson needs an uploaded file or an HTTPS source.');
      safeHttps(lesson.external_url, 'Lesson source');
    }
  }
}

function courseValues(body: Record<string, unknown>, actor: AdminActor, existing?: RowDataPacket): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key) || !existing;
  if (has('title')) value.title = textValue(body.title, 'Title', 200);
  if (has('slug')) value.slug = slugValue(body.slug);
  if (has('short_description')) value.short_description = optionalText(body.short_description, 'Summary', 600);
  if (has('description')) value.description = safeContent(body.description, 'Description');
  if (has('image')) value.image = safeHttps(body.image, 'Thumbnail', true);
  for (const field of ['category_id','language_id']) if (has(field)) value[field] = body[field] ? idValue(body[field], field) : null;
  if (has('instructor_id')) value.instructor_id = body.instructor_id ? idValue(body.instructor_id, 'author') : actor.id;
  if (has('level')) value.level = enumValue(body.level || 'beginner', ['beginner','intermediate','advanced'], 'level');
  if (has('price')) value.price = money(body.price ?? 0);
  if (has('status')) value.status = enumValue(body.status || 'draft', ['draft','published','archived'], 'course status');
  return value;
}

async function createOrUpdateCourse(id: number | null, body: Record<string, unknown>, actor: AdminActor) {
  return transaction(async connection => {
    const existing = id ? await getRow('ir_courses', id, connection, true) : undefined;
    const values = courseValues(body, actor, existing);
    await validateCourseReferences({ ...existing, ...values }, connection);
    const courseId = id || await insertRow('ir_courses', values, connection);
    if (id) await updateRow('ir_courses', id, values, connection);
    await ensureCoursePublishable(courseId, connection);
    await audit(connection, actor, id ? 'course.update' : 'course.create', 'course', courseId, { fields: Object.keys(values), status: values.status || existing?.status });
    return courseDetail(courseId, connection);
  });
}

async function saveLesson(id: number | null, chapterId: number, body: Record<string, unknown>, actor: AdminActor) {
  return transaction(async connection => {
    const chapter = await getRow('ir_chapters', chapterId, connection);
    await getRow('ir_courses',Number(chapter.course_id),connection,true);
    const existing = id ? await getRow('ir_lessons', id, connection, true) : undefined;
    if (existing && Number(existing.course_id) !== Number(chapter.course_id)) throw new ApiError(422, 'A lesson cannot move to a different course.');
    const has = (field: string) => Object.prototype.hasOwnProperty.call(body, field) || !existing;
    const values: Record<string, unknown> = { chapter_id: chapterId, course_id: chapter.course_id };
    if (has('title')) values.title = textValue(body.title, 'Lesson title', 200);
    if (has('type')) values.type = enumValue(body.type, ['video','audio','pdf','text'], 'lesson type');
    if (has('content') || Object.prototype.hasOwnProperty.call(body, 'content_text')) values.content = safeContent(body.content ?? body.content_text, 'Lesson content');
    if (has('external_url') || Object.prototype.hasOwnProperty.call(body, 'source_url')) values.external_url = safeHttps(body.external_url ?? body.source_url, 'Lesson source') || null;
    if (has('media_id')) values.media_id = body.media_id ? idValue(body.media_id, 'media') : null;
    if (has('duration_seconds')) values.duration_seconds = integerValue(body.duration_seconds, 'Duration', 0, 604800);
    if (has('position')) values.position = integerValue(body.position, 'Position');
    if (has('is_preview')) values.is_preview = booleanValue(body.is_preview);
    if (has('is_published')) values.is_published = booleanValue(body.is_published, true);
    const final = { ...existing, ...values };
    if (final.media_id) {
      const media = await getRow('ir_media', Number(final.media_id), connection);
      if (media.kind !== (final.type === 'pdf' ? 'document' : final.type)) throw new ApiError(422, 'The uploaded file must match the lesson type.');
      if (media.is_public) throw new ApiError(422, 'Course lesson files must use protected uploads, not public images.');
    }
    const lessonId = id || await insertRow('ir_lessons', values, connection);
    if (id) await updateRow('ir_lessons', id, values, connection);
    await ensureCoursePublishable(Number(chapter.course_id), connection);
    await audit(connection, actor, id ? 'lesson.update' : 'lesson.create', 'lesson', lessonId, { course_id: chapter.course_id, fields: Object.keys(values) });
    return mapLesson(await getRow('ir_lessons', lessonId, connection));
  });
}

async function reorder(courseId: number, body: Record<string, unknown>, actor: AdminActor) {
  return transaction(async connection => {
    await getRow('ir_courses', courseId, connection, true);
    if (body.chapter_ids !== undefined) {
      if (!Array.isArray(body.chapter_ids) || body.chapter_ids.length > 1000) throw new ApiError(422, 'Provide an ordered chapter list.');
      const ids = body.chapter_ids.map(value => idValue(value));
      const [rows] = await connection.execute<RowDataPacket[]>('SELECT id FROM ir_chapters WHERE course_id = ?', [courseId]);
      if (ids.length !== rows.length || new Set(ids).size !== ids.length || rows.some(row => !ids.includes(Number(row.id)))) throw new ApiError(422, 'The chapter order must contain every chapter exactly once.');
      for (let index = 0; index < ids.length; index++) await connection.execute('UPDATE ir_chapters SET position = ? WHERE id = ? AND course_id = ?', [index, ids[index], courseId]);
    }
    if (body.lessons !== undefined) {
      if (!Array.isArray(body.lessons) || body.lessons.length > 1000) throw new ApiError(422, 'Provide ordered lesson lists.');
      for (const entry of body.lessons) {
        if (!entry || typeof entry !== 'object' || !Array.isArray(entry.lesson_ids)) throw new ApiError(422, 'Invalid lesson order.');
        const chapterId = idValue(entry.chapter_id);
        const chapter = await getRow('ir_chapters', chapterId, connection);
        if (Number(chapter.course_id) !== courseId) throw new ApiError(422, 'This chapter belongs to a different course.');
        const ids = entry.lesson_ids.map((value: unknown) => idValue(value));
        const [rows] = await connection.execute<RowDataPacket[]>('SELECT id FROM ir_lessons WHERE chapter_id = ?', [chapterId]);
        if (ids.length !== rows.length || new Set(ids).size !== ids.length || rows.some(row => !ids.includes(Number(row.id)))) throw new ApiError(422, 'The lesson order must contain every lesson exactly once.');
        for (let index = 0; index < ids.length; index++) await connection.execute('UPDATE ir_lessons SET position = ? WHERE id = ? AND chapter_id = ?', [index, ids[index], chapterId]);
      }
    }
    await audit(connection, actor, 'course.reorder', 'course', courseId);
    return courseDetail(courseId, connection);
  });
}

export async function courseAdmin(method: string, parts: string[], body: Record<string, unknown>, actor: AdminActor, params: URLSearchParams): Promise<unknown> {
  const id = parts[1] ? idValue(parts[1]) : null;
  if (parts[0] === 'courses') {
    if (!id && method === 'GET') {
      const search = searchClause(params, ['c.title','c.slug']);
      let where = search.where;
      const values: (string|number)[] = [...search.values];
      if (params.get('status')) { where += `${where ? ' AND' : 'WHERE'} c.status = ?`; values.push(enumValue(params.get('status'), ['draft','published','archived'], 'course status')); }
      return adminList('ir_courses c LEFT JOIN ir_users u ON u.id=c.instructor_id LEFT JOIN ir_categories cat ON cat.id=c.category_id', 'c.*,u.name AS instructor_name,cat.name AS category_name', params, where, values, 'c.created_at DESC,c.id DESC');
    }
    if (!id && method === 'POST') return createOrUpdateCourse(null, body, actor);
    if (id && parts[2] === 'order' && method === 'POST') return reorder(id, body, actor);
    if (id && parts[2] === 'chapters') {
      await getRow('ir_courses', id);
      if (method === 'GET') {
        const detail = await courseDetail(id);
        return { items: detail.chapters, total: detail.chapters.length, page: 1, per_page: detail.chapters.length, total_pages: 1 };
      }
      if (method === 'POST') return transaction(async connection => {
        const chapterId = await insertRow('ir_chapters', { course_id: id, title: textValue(body.title, 'Chapter title', 200), position: integerValue(body.position, 'Position') }, connection);
        await audit(connection, actor, 'chapter.create', 'chapter', chapterId, { course_id: id });
        return { ...await getRow('ir_chapters', chapterId, connection), lessons: [] };
      });
    }
    if (id && parts.length === 2 && method === 'GET') return courseDetail(id);
    if (id && parts.length === 2 && ['PATCH','PUT'].includes(method)) return createOrUpdateCourse(id, body, actor);
    if (id && parts.length === 2 && method === 'DELETE') return transaction(async connection => {
      await getRow('ir_courses', id, connection, true);
      const [references] = await connection.execute<RowDataPacket[]>('SELECT (SELECT COUNT(*) FROM ir_order_items WHERE course_id = ?) + (SELECT COUNT(*) FROM ir_enrollments WHERE course_id = ?) AS total', [id,id]);
      if (Number(references[0].total)) throw new ApiError(409, 'This practice has orders or enrollments. Archive it to preserve learner and payment history.');
      await connection.execute('DELETE FROM ir_courses WHERE id = ?', [id]);
      await audit(connection, actor, 'course.delete', 'course', id);
      return { deleted: true };
    });
  }
  if (parts[0] === 'chapters' && id) {
    const chapter = await getRow('ir_chapters', id);
    if (parts[2] === 'lessons') {
      if (method === 'GET') {
        const [rows] = await database().execute<RowDataPacket[]>('SELECT l.*,m.original_name AS media_name FROM ir_lessons l LEFT JOIN ir_media m ON m.id=l.media_id WHERE l.chapter_id = ? ORDER BY l.position,l.id', [id]);
        return { items: rows.map(mapLesson), total: rows.length, page: 1, per_page: rows.length, total_pages: 1 };
      }
      if (method === 'POST') return saveLesson(null, id, body, actor);
    }
    if (parts.length === 2 && ['PATCH','PUT'].includes(method)) return transaction(async connection => {
      const values: Record<string,unknown> = {};
      if (body.title !== undefined) values.title = textValue(body.title, 'Chapter title', 200);
      if (body.position !== undefined) values.position = integerValue(body.position, 'Position');
      await updateRow('ir_chapters', id, values, connection);
      await audit(connection, actor, 'chapter.update', 'chapter', id, { fields: Object.keys(values) });
      return getRow('ir_chapters', id, connection);
    });
    if (parts.length === 2 && method === 'DELETE') return transaction(async connection => {
      await getRow('ir_courses',Number(chapter.course_id),connection,true);
      await connection.execute('DELETE FROM ir_chapters WHERE id = ?', [id]);
      await ensureCoursePublishable(Number(chapter.course_id), connection);
      await audit(connection, actor, 'chapter.delete', 'chapter', id, { course_id: chapter.course_id });
      return { deleted: true };
    });
  }
  if (parts[0] === 'lessons' && id && parts.length === 2) {
    const lesson = await getRow('ir_lessons', id);
    if (method === 'GET') return mapLesson(lesson);
    if (['PATCH','PUT'].includes(method)) return saveLesson(id, body.chapter_id ? idValue(body.chapter_id) : Number(lesson.chapter_id), body, actor);
    if (method === 'DELETE') return transaction(async connection => {
      await getRow('ir_courses',Number(lesson.course_id),connection,true);
      await connection.execute('DELETE FROM ir_lessons WHERE id = ?', [id]);
      await ensureCoursePublishable(Number(lesson.course_id), connection);
      await audit(connection, actor, 'lesson.delete', 'lesson', id, { course_id: lesson.course_id });
      return { deleted: true };
    });
  }
  throw new ApiError(404, 'This course administration endpoint does not exist.');
}
