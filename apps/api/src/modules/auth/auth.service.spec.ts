import { ConflictException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
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

const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: mockVerifyIdToken })),
}));

const googlePayload = (overrides: Record<string, unknown> = {}) => ({
  sub: 'google-sub-123',
  email: 'guser@example.com',
  email_verified: true,
  name: 'Google User',
  picture: 'https://lh3.googleusercontent.com/a/pic',
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const jwtService = { sign: jest.fn(() => 'signed.jwt.token') };
  const config = {
    getOrThrow: jest.fn(() => 'test-secret'),
    get: jest.fn((key: string): string => (key === 'auth.googleClientId' ? 'test-client-id' : '30m')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => googlePayload() });

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

    it('rejects a passwordless (Google-only) account', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ email: dto.email, passwordHash: null }));

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle', () => {
    const dto = { idToken: 'google.id.token' };

    it('verifies the ID token against the configured client id', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser());

      await service.loginWithGoogle(dto);

      expect(mockVerifyIdToken).toHaveBeenCalledWith({
        idToken: dto.idToken,
        audience: 'test-client-id',
      });
    });

    it('returns a token for an existing Google user without touching create/update', async () => {
      const user = makeUser({ email: 'guser@example.com' });
      usersService.findByGoogleId.mockResolvedValue(user);

      const result = await service.loginWithGoogle(dto);

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe('guser@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('links Google to an existing email/password account', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      const existing = makeUser({ email: 'guser@example.com' });
      usersService.findByEmail.mockResolvedValue(existing);
      usersService.update.mockResolvedValue({ ...existing, googleId: 'google-sub-123' });

      await service.loginWithGoogle(dto);

      expect(usersService.update).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({ googleId: 'google-sub-123' }),
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('provisions a new CUSTOMER account on first sign-in', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser({ email: 'guser@example.com' }));

      await service.loginWithGoogle({ idToken: dto.idToken, role: Role.VENDOR });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'guser@example.com',
          googleId: 'google-sub-123',
          role: Role.VENDOR,
        }),
      );
    });

    it('rejects an unverified Google email', async () => {
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => googlePayload({ email_verified: false }) });

      await expect(service.loginWithGoogle(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an invalid / unverifiable ID token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token signature'));

      await expect(service.loginWithGoogle(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('fails clearly when Google sign-in is not configured', async () => {
      config.get.mockImplementation((key: string) => (key === 'auth.googleClientId' ? '' : '30m'));

      await expect(service.loginWithGoogle(dto)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});
