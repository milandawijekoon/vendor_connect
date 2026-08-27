-- Rename the `COUPLE` role to `CUSTOMER` (marketplace pivot: any occasion, not only weddings).
-- MySQL cannot rename an ENUM member directly, so widen the set, migrate rows, then narrow it.

-- 1. Temporarily allow both the old and new values.
ALTER TABLE `User`
  MODIFY COLUMN `role` ENUM('COUPLE', 'CUSTOMER', 'VENDOR', 'ADMIN') NOT NULL DEFAULT 'COUPLE';

-- 2. Migrate existing rows.
UPDATE `User` SET `role` = 'CUSTOMER' WHERE `role` = 'COUPLE';

-- 3. Drop the old value and set the new default.
ALTER TABLE `User`
  MODIFY COLUMN `role` ENUM('CUSTOMER', 'VENDOR', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER';
