CREATE TABLE IF NOT EXISTS ir_coupons (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 created_by BIGINT UNSIGNED NOT NULL,
 code VARCHAR(40) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL UNIQUE,
 message VARCHAR(500) NOT NULL DEFAULT '',
 starts_at DATETIME NOT NULL,
 ends_at DATETIME NOT NULL,
 discount_type ENUM('percentage','amount') NOT NULL,
 discount DECIMAL(10,2) NOT NULL,
 maximum_discount DECIMAL(10,2) NULL,
 minimum_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
 total_usage_limit INT UNSIGNED NOT NULL DEFAULT 0,
 per_user_limit INT UNSIGNED NOT NULL DEFAULT 0,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 deleted_at DATETIME NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT ir_coupon_creator FOREIGN KEY(created_by) REFERENCES ir_users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ir_coupon_courses (
 coupon_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 PRIMARY KEY(coupon_id,course_id),
 CONSTRAINT ir_coupon_scope_coupon FOREIGN KEY(coupon_id) REFERENCES ir_coupons(id) ON DELETE CASCADE,
 CONSTRAINT ir_coupon_scope_course FOREIGN KEY(course_id) REFERENCES ir_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ir_coupon_redemptions (
 order_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
 coupon_id BIGINT UNSIGNED NOT NULL,
 user_id BIGINT UNSIGNED NOT NULL,
 discount_amount DECIMAL(10,2) NOT NULL,
 status ENUM('reserved','redeemed','released') NOT NULL DEFAULT 'reserved',
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT ir_redemption_order FOREIGN KEY(order_id) REFERENCES ir_orders(id) ON DELETE CASCADE,
 CONSTRAINT ir_redemption_coupon FOREIGN KEY(coupon_id) REFERENCES ir_coupons(id) ON DELETE RESTRICT,
 CONSTRAINT ir_redemption_user FOREIGN KEY(user_id) REFERENCES ir_users(id) ON DELETE RESTRICT,
 KEY ir_redemption_usage(coupon_id,status,user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE ir_orders ADD COLUMN coupon_id BIGINT UNSIGNED NULL, ADD COLUMN coupon_code VARCHAR(40) NULL, ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0, ADD COLUMN subtotal DECIMAL(10,2) NULL;
ALTER TABLE ir_order_items ADD COLUMN original_amount DECIMAL(10,2) NULL;
CREATE TABLE IF NOT EXISTS ir_refund_requests (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 order_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 user_id BIGINT UNSIGNED NOT NULL,
 amount DECIMAL(10,2) NOT NULL,
 reason TEXT NOT NULL,
 status ENUM('pending','approved','rejected','processing','refunded') NOT NULL DEFAULT 'pending',
 staff_comment TEXT NULL,
 responded_by BIGINT UNSIGNED NULL,
 responded_at DATETIME NULL,
 manual_reference VARCHAR(200) NULL,
 refund_method ENUM('manual','razorpay') NULL,
 provider_refund_id VARCHAR(100) NULL UNIQUE,
 processed_by BIGINT UNSIGNED NULL,
 processed_at DATETIME NULL,
 evidence_name VARCHAR(100) NULL,
 evidence_mime VARCHAR(100) NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY ir_refund_item(order_id,course_id),
 CONSTRAINT ir_refund_order FOREIGN KEY(order_id) REFERENCES ir_orders(id) ON DELETE RESTRICT,
 CONSTRAINT ir_refund_course FOREIGN KEY(course_id) REFERENCES ir_courses(id) ON DELETE RESTRICT,
 CONSTRAINT ir_refund_user FOREIGN KEY(user_id) REFERENCES ir_users(id) ON DELETE RESTRICT,
 CONSTRAINT ir_refund_responder FOREIGN KEY(responded_by) REFERENCES ir_users(id) ON DELETE SET NULL,
 CONSTRAINT ir_refund_processor FOREIGN KEY(processed_by) REFERENCES ir_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ir_withdrawals (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 amount DECIMAL(10,2) NOT NULL,
 payment_method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',
 bank_details JSON NOT NULL,
 notes TEXT NULL,
 status ENUM('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
 manual_reference VARCHAR(200) NULL,
 processed_by BIGINT UNSIGNED NULL,
 processed_at DATETIME NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT ir_withdrawal_user FOREIGN KEY(user_id) REFERENCES ir_users(id) ON DELETE RESTRICT,
 CONSTRAINT ir_withdrawal_processor FOREIGN KEY(processed_by) REFERENCES ir_users(id) ON DELETE SET NULL,
 KEY ir_withdrawal_status(user_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ir_team_invitations (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 inviter_id BIGINT UNSIGNED NOT NULL,
 invitee_email VARCHAR(254) NOT NULL,
 invitation_token CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
 invitee_user_id BIGINT UNSIGNED NULL,
 status ENUM('pending','accepted','rejected','removed') NOT NULL DEFAULT 'pending',
 member_role ENUM('assistant','editor') NOT NULL DEFAULT 'editor',
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY ir_team_invite(inviter_id,invitee_email),
 CONSTRAINT ir_team_inviter FOREIGN KEY(inviter_id) REFERENCES ir_users(id) ON DELETE CASCADE,
 CONSTRAINT ir_team_invitee FOREIGN KEY(invitee_user_id) REFERENCES ir_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ir_team_course_members (
 invitation_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 PRIMARY KEY(invitation_id,course_id),
 CONSTRAINT ir_team_course_invitation FOREIGN KEY(invitation_id) REFERENCES ir_team_invitations(id) ON DELETE CASCADE,
 CONSTRAINT ir_team_course_course FOREIGN KEY(course_id) REFERENCES ir_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ir_cart_coupon (
 user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
 coupon_id BIGINT UNSIGNED NOT NULL,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT ir_cart_coupon_user FOREIGN KEY(user_id) REFERENCES ir_users(id) ON DELETE CASCADE,
 CONSTRAINT ir_cart_coupon_code FOREIGN KEY(coupon_id) REFERENCES ir_coupons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
