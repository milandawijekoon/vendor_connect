import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import type { AuthResponseDto } from '@vendorconnect/shared';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ACCESS_TOKEN_COOKIE, parseDurationMs } from './auth.constants';

const AUTH_RESPONSE_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiJ9...',
  user: { id: 'clxxxxxxx', email: 'user@example.com', name: 'Jane Doe', role: 'CUSTOMER', phone: null },
};

const ERROR_400 = { schema: { example: { statusCode: 400, message: ['email must be an email'], error: 'Bad Request' } } };
const ERROR_401 = { schema: { example: { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' } } };
const ERROR_409 = { schema: { example: { statusCode: 409, message: 'Email already in use', error: 'Conflict' } } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  /** Frontend and API run on different subdomains in staging/production, so the cookie must be usable cross-site. */
  private getCookieOptions(): { httpOnly: true; secure: boolean; sameSite: 'lax' | 'none'; path: string } {
    const isProduction = this.config.get<string>('nodeEnv') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };
  }

  /** Sets the HttpOnly access-token cookie consumed by JwtStrategy; the token in the response body remains for non-browser clients. */
  private setAuthCookie(res: Response, accessToken: string): void {
    const maxAge = parseDurationMs(this.config.get<string>('auth.jwtExpiresIn') ?? '30m');
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...this.getCookieOptions(), maxAge });
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new account',
    description: 'Creates a `CUSTOMER` or `VENDOR` account. Returns a signed JWT immediately — no email verification at MVP.',
  })
  @ApiCreatedResponse({ description: 'Account created. Use `accessToken` in subsequent requests.', schema: { example: AUTH_RESPONSE_EXAMPLE } })
  @ApiBadRequestResponse({ ...ERROR_400, description: 'Validation failed (missing field, weak password, etc.)' })
  @ApiConflictResponse({ ...ERROR_409, description: 'Email is already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto);
    this.setAuthCookie(res, result.accessToken);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login', description: 'Validates credentials and returns a signed JWT.' })
  @ApiOkResponse({ description: 'Login successful.', schema: { example: AUTH_RESPONSE_EXAMPLE } })
  @ApiBadRequestResponse({ ...ERROR_400, description: 'Validation failed' })
  @ApiUnauthorizedResponse({ ...ERROR_401, description: 'Email or password is incorrect' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    this.setAuthCookie(res, result.accessToken);
    return result;
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login or sign up with Google',
    description:
      'Verifies a Google ID token from Google Identity Services. Links to an existing account by email, or creates a new `CUSTOMER`/`VENDOR` account on first sign-in. Returns the same signed JWT as email login.',
  })
  @ApiOkResponse({ description: 'Google sign-in successful.', schema: { example: AUTH_RESPONSE_EXAMPLE } })
  @ApiBadRequestResponse({ ...ERROR_400, description: 'Missing or malformed idToken' })
  @ApiUnauthorizedResponse({ ...ERROR_401, description: 'Google credential invalid or email unverified' })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.loginWithGoogle(dto);
    this.setAuthCookie(res, result.accessToken);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout', description: 'Clears the HttpOnly access-token cookie.' })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.getCookieOptions());
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get current user', description: 'Returns the authenticated user decoded from the JWT. Useful for bootstrapping client-side auth state.' })
  @ApiOkResponse({ schema: { example: { id: 'clxxxxxxx', email: 'user@example.com', role: 'CUSTOMER' } } })
  @ApiUnauthorizedResponse({ ...ERROR_401, description: 'Token missing or expired' })
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
