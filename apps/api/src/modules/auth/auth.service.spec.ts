import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Role } from '@vendorconnect/shared';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { makeUser } from '../../test/factories';

jest.mock('bcrypt');
const mockedBcrypt = jest.mocked(bcrypt);

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = { sign: jest.fn(() => 'signed.jwt.token') };
  const config = {
    getOrThrow: jest.fn(() => 'test-secret'),
    get: jest.fn(() => '30m'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    const dto = { name: 'Nimal', email: 'nimal@example.com', password: 'sup3rsecret', phone: '+94771234567' };

    it('creates a user with a hashed password and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const created = makeUser({ email: dto.email, role: Role.CUSTOMER });
      usersService.create.mockResolvedValue(created);

      const result = await service.register(dto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email, passwordHash: 'hashed-pw', role: Role.CUSTOMER }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toMatchObject({ id: created.id, email: dto.email });
    });

    it('defaults role to CUSTOMER and phone to null when omitted', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser());

      await service.register({ name: 'A', email: 'a@example.com', password: 'password123' });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.CUSTOMER, phone: null }),
      );
    });

    it('rejects a duplicate email', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ email: dto.email }));

      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'nimal@example.com', password: 'sup3rsecret' };

    it('returns a token for valid credentials', async () => {
      const user = makeUser({ email: dto.email });
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login(dto);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(dto.email);
    });

    it('rejects an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ email: dto.email }));
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
