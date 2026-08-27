import { Test } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const repo = {
    findAll: jest.fn(),
    findManyByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [CategoriesService, { provide: CategoriesRepository, useValue: repo }],
    }).compile();
    service = moduleRef.get(CategoriesService);
  });

  it('findAll returns every category from the repository', async () => {
    const categories = [
      { id: 'c1', name: 'Photography', slug: 'photography' },
      { id: 'c2', name: 'Catering', slug: 'catering' },
    ];
    repo.findAll.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toEqual(categories);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  it('findManyByIds forwards the id list', async () => {
    repo.findManyByIds.mockResolvedValue([]);

    await service.findManyByIds(['c1', 'c2']);

    expect(repo.findManyByIds).toHaveBeenCalledWith(['c1', 'c2']);
  });
});
