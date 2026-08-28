-- AlterTable: passwordHash is optional for OAuth-only accounts; add Google identity columns
ALTER TABLE `User`
    MODIFY `passwordHash` VARCHAR(191) NULL,
    ADD COLUMN `googleId` VARCHAR(191) NULL,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
