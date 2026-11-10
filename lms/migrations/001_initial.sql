CREATE TABLE IF NOT EXISTS ir_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ir_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_sessions (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  KEY ir_sessions_expiry (expires_at),
  CONSTRAINT ir_sessions_user FOREIGN KEY (user_id) REFERENCES ir_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_rate_limits (
  key_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  attempts INT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME NOT NULL,
  KEY ir_rate_limits_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_languages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  code VARCHAR(12) NOT NULL UNIQUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  image VARCHAR(500) NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  short_description VARCHAR(600) NOT NULL DEFAULT '',
  description MEDIUMTEXT NULL,
  image VARCHAR(500) NOT NULL DEFAULT '',
  category_id INT UNSIGNED NULL,
  language_id INT UNSIGNED NULL,
  instructor_id BIGINT UNSIGNED NULL,
  level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ir_courses_public (status, created_at),
  CONSTRAINT ir_courses_category FOREIGN KEY (category_id) REFERENCES ir_categories(id) ON DELETE SET NULL,
  CONSTRAINT ir_courses_language FOREIGN KEY (language_id) REFERENCES ir_languages(id) ON DELETE SET NULL,
  CONSTRAINT ir_courses_instructor FOREIGN KEY (instructor_id) REFERENCES ir_users(id) ON DELETE SET NULL,
  CONSTRAINT ir_courses_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Real site configuration only. No learner accounts or courses are seeded.
INSERT IGNORE INTO ir_languages (name, code, is_default) VALUES ('English', 'en', TRUE);
INSERT IGNORE INTO ir_categories (name, slug, description) VALUES
  ('Meditation', 'meditation', 'Guided meditation and awareness practices.'),
  ('Yoga', 'yoga', 'Breath, movement and awareness.'),
  ('Personal growth', 'mindfulness', 'Mindfulness and self-awareness.');
INSERT IGNORE INTO ir_settings (setting_key, setting_value) VALUES ('web', JSON_OBJECT(
  'app_name', 'Inner Revealing',
  'web_name', 'Inner Revealing',
  'website_url', 'https://ir.vishwalabs.com',
  'system_color', '#5700b8',
  'system_light_colour', '#f3ebfa',
  'hover_color', '#450092',
  'currency_code', 'INR',
  'currency_symbol', '₹',
  'tax_type', 'exclusive',
  'active_payment_settings', JSON_ARRAY(),
  'instructor_response_hours', '',
  'individual_instructor_terms', '',
  'team_instructor_terms', '',
  'announcement_bar', '',
  'favicon', '/inner-revealing-logo.png',
  'horizontal_logo', '/inner-revealing-logo.png',
  'vertical_logo', '/inner-revealing-logo.png',
  'placeholder_image', '/inner-revealing-logo.png',
  'playstore_url', NULL,
  'appstore_url', NULL,
  'contact_address', 'Satish Mukherjee Road, Kalighat, Kolkata, West Bengal 700026, India',
  'contact_email', 'innerrevealing@gmail.com',
  'contact_phone', '+919836147999',
  'schema', '',
  'refund_enabled', '0',
  'refund_period_days', '0',
  'maintaince_mode', '0',
  'footer_description', 'Meditation Centre, Psychological Counselling and Healing Centre in Kolkata.',
  'website_copyright', '<p>© Inner Revealing Meditation Centre. All rights reserved.</p>',
  'instructor_mode', 'single',
  'weekly_average_watch_hours', 0,
  'social_media', JSON_ARRAY(
    JSON_OBJECT('id', 1, 'name', 'Facebook', 'icon', '', 'url', 'https://www.facebook.com/infinitelovemed'),
    JSON_OBJECT('id', 2, 'name', 'Instagram', 'icon', '', 'url', 'https://www.instagram.com/infinitelovemeditation'),
    JSON_OBJECT('id', 3, 'name', 'YouTube', 'icon', '', 'url', 'https://www.youtube.com/@innerrevealing')
  )
));
