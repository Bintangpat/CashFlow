-- AlterTable - Make password_hash NOT NULL
-- This migration will FAIL if there are existing users with NULL password_hash
-- Solution: Either delete existing users or set a temporary password

-- Option 1: Delete all existing users (DEVELOPMENT ONLY)
DELETE FROM "users";

-- Option 2: If you want to keep users, set temporary passwords
-- UPDATE "users" SET "password_hash" = '$2a$10$temp_hash_value' WHERE "password_hash" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
