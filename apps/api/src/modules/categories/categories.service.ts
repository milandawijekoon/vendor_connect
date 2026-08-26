import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  findManyByIds(ids: string[]) {
    return this.repo.findManyByIds(ids);
  }
}
