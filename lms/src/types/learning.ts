export type LessonKind = 'video' | 'audio' | 'pdf' | 'text' | 'resource' | 'quiz' | 'assignment';
export interface LessonSummary { id: number; chapter_id: number; course_id: number; title: string; type: LessonKind; duration_seconds: number; is_preview: boolean; position: number }
export interface LearningChapter { id: number; title: string; position: number; lessons: LessonSummary[] }
export interface LearningCourse { id: number; slug: string; title: string; short_description: string; description?: string | null; image: string; price: number; author_name?: string; category_name?: string; language?: string }
export interface CourseOverviewData { course: LearningCourse; chapters: LearningChapter[]; enrolled: boolean; can_manage: boolean; saved: boolean; completed_lesson_ids: number[]; sequential_access?:boolean }
export interface LessonData extends LessonSummary { content: string | null; source_url: string | null; completed: boolean; position_seconds: number; enrolled: boolean;assessment_id?:number;resources?:{id:number;title:string;type:'file'|'url';source_url:string}[] }
export interface LibraryItem { course: LearningCourse; completed_lessons: number; total_lessons: number; progress_percent: number; enrolled_at: string }
