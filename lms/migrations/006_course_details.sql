ALTER TABLE ir_lessons MODIFY type ENUM('video','audio','pdf','text','quiz','assignment','resource') NOT NULL;
ALTER TABLE ir_chapters ADD COLUMN description TEXT NULL,
 ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE ir_course_details (
 course_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
 metadata JSON NOT NULL,
 CONSTRAINT ir_course_details_course FOREIGN KEY(course_id) REFERENCES ir_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ir_lesson_details (
 lesson_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
 metadata JSON NOT NULL,
 CONSTRAINT ir_lesson_details_lesson FOREIGN KEY(lesson_id) REFERENCES ir_lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ir_lesson_resources (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 lesson_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(200) NOT NULL,
 type ENUM('file','url') NOT NULL,
 media_id BIGINT UNSIGNED NULL,
 url VARCHAR(2000) NULL,
 position INT UNSIGNED NOT NULL DEFAULT 0,
 CONSTRAINT ir_lesson_resources_lesson FOREIGN KEY(lesson_id) REFERENCES ir_lessons(id) ON DELETE CASCADE,
 CONSTRAINT ir_lesson_resources_media FOREIGN KEY(media_id) REFERENCES ir_media(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
