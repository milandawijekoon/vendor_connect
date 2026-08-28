-- AlterTable
ALTER TABLE `VendorProfile` ADD COLUMN `facebookUrl` TEXT NULL,
    ADD COLUMN `googleRating` DOUBLE NULL,
    ADD COLUMN `googleReviewCount` INTEGER NULL,
    ADD COLUMN `googleUrl` TEXT NULL;

-- CreateTable
CREATE TABLE `ExternalReview` (
    `id` VARCHAR(191) NOT NULL,
    `vendorId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'GOOGLE',
    `authorName` VARCHAR(191) NOT NULL,
    `authorPhotoUrl` TEXT NULL,
    `rating` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `relativeTime` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ExternalReview_vendorId_idx`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExternalReview` ADD CONSTRAINT `ExternalReview_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `VendorProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
