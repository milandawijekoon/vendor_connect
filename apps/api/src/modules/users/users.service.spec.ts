import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { makeUser } from '../../test/factories';

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: repo }],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('findById delegates to the repository', async () => {
    const user = makeUser();
    repo.findById.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toBe(user);
    expect(repo.findById).toHaveBeenCalledWith(user.id);
  });

  it('findByEmail delegates to the repository', async () => {
    repo.findByEmail.mockResolvedValue(null);

    await expect(service.findByEmail('nobody@example.com')).resolves.toBeNull();
    expect(repo.findByEmail).toHaveBeenCalledWith('nobody@example.com');
  });

  it('create delegates to the repository', async () => {
    const data = { name: 'A', email: 'a@example.com', passwordHash: 'h', role: 'CUSTOMER' as const };
    const created = makeUser(data);
    repo.create.mockResolvedValue(created);

    await expect(service.create(data)).resolves.toBe(created);
    expect(repo.create).toHaveBeenCalledWith(data);
  });
});
