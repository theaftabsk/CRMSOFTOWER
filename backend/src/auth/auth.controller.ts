import { Controller, Post, Body, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(dto);

    // Set Secure HttpOnly Cookies for Access & Refresh Tokens
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('crm_access_token', result.accessToken, cookieOptions);
    res.cookie('crm_refresh_token', `refresh_${result.accessToken}`, cookieOptions);

    return {
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(dto);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('crm_access_token', result.accessToken, cookieOptions);
    res.cookie('crm_refresh_token', `refresh_${result.accessToken}`, cookieOptions);

    return {
      message: 'Registration successful',
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    // Check Authorization header or HttpOnly cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies ? req.cookies['crm_access_token'] : undefined;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new UnauthorizedException('No active authentication session');
    }

    // Token format: crm_token_<userId>_<timestamp> or token_<userId>_<timestamp>
    const match = token.match(/(?:crm_token_|token_)([^_]+)/);
    const userId = match ? match[1] : null;

    if (!userId) {
      throw new UnauthorizedException('Invalid authentication session');
    }

    return this.authService.getSession(userId);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('crm_access_token', { path: '/' });
    res.clearCookie('crm_refresh_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
