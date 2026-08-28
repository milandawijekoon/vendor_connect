import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import type { AuthResponseDto, AuthUserDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { UsersService } from '../users/users.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { GoogleLoginDto } from './dto/google-login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? Role.CUSTOMER,
      phone: dto.phone ?? null,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildAuthResponse(user);
  }

  /**
   * Verifies a Google ID token (issued to the browser by Google Identity Services),
   * then links it to an existing account by `googleId` or `email`, or provisions a
   * new account. Returns the same JWT contract as email login.
   */
  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthResponseDto> {
    const clientId = this.config.get<string>('auth.googleClientId');
    if (!clientId) {
      this.logger.error('Google sign-in attempted but GOOGLE_CLIENT_ID is not configured');
      throw new ServiceUnavailableException('Google sign-in is not available');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken: dto.idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google credential');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Your Google account email is not verified');
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name?.trim() || email.split('@')[0];
    const avatarUrl = payload.picture ?? null;

    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      const existing = await this.usersService.findByEmail(email);
      if (existing) {
        // Existing email/password account — link the Google identity to it.
        user = await this.usersService.update(existing.id, {
          googleId,
          avatarUrl: existing.avatarUrl ?? avatarUrl,
        });
      } else {
        user = await this.usersService.create({
          name,
          email,
          googleId,
          avatarUrl,
          role: dto.role ?? Role.CUSTOMER,
        });
      }
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | null;
  }): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('auth.jwtSecret'),
      expiresIn: this.config.get<string>('auth.jwtExpiresIn') ?? '30m',
    });

    const authUser: AuthUserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUserDto['role'],
      phone: user.phone,
    };

    return { accessToken, user: authUser };
  }
}
