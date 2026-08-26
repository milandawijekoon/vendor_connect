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

  create(data: Prisma.UserCreateInput) {
    return this.repo.create(data);
  }
}
