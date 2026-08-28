import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findById(id: string) {
    return this.repo.findById(id);
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  findByGoogleId(googleId: string) {
    return this.repo.findByGoogleId(googleId);
  }

  create(data: Prisma.UserCreateInput) {
    return this.repo.create(data);
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.repo.update(id, data);
  }
}
