-- CreateTable
CREATE TABLE `GoldPriceSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `auctionDate` VARCHAR(191) NOT NULL,
    `auction` VARCHAR(191) NOT NULL DEFAULT 'pm',
    `source` VARCHAR(191) NOT NULL DEFAULT 'LBMA',
    `usdPerOz` DOUBLE NOT NULL,
    `usdToLkr` DOUBLE NOT NULL,
    `retailPremiumPct` DOUBLE NOT NULL DEFAULT 0,
    `worldPerGram24k` DOUBLE NOT NULL,
    `worldPerGram22k` DOUBLE NOT NULL,
    `worldPerGram18k` DOUBLE NOT NULL,
    `lkrPerGram24k` DOUBLE NOT NULL,
    `lkrPerGram22k` DOUBLE NOT NULL,
    `lkrPerGram18k` DOUBLE NOT NULL,
    `lkrPerSovereign22k` DOUBLE NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GoldPriceSnapshot_auctionDate_key`(`auctionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
