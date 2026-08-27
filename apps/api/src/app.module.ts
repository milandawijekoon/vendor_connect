import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { SearchModule } from './modules/search/search.module';
import { MailModule } from './modules/mail/mail.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { MetaModule } from './modules/meta/meta.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([{ name: 'global', ttl: 60_000, limit: 100 }]),
    PrismaModule,
    CloudinaryModule,
    SearchModule,
    MailModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    VendorsModule,
    InquiriesModule,
    ReviewsModule,
    AdminModule,
    MetaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
