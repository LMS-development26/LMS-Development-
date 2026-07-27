CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_login_attempt_user
ON login_attempts(user_id);

CREATE INDEX idx_email_token_user
ON email_verification_tokens(user_id);

CREATE INDEX idx_email_token_hash
ON email_verification_tokens(token_hash);

CREATE INDEX idx_student_user
ON student_profiles(user_id);