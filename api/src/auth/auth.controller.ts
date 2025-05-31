import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Services
import { AuthService } from './auth.service';

// DTOs
import { SignupDTO } from '../user/dto/createUser.dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO } from './dto/login-dto';

// Guards
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Signup And Confirm
  @Post('signup')
  async signup(
    @Body() signupDto: SignupDTO,
    @Session() session: Record<string, any>,
  ) {
    return await this.authService.signup(signupDto, session);
  }

  @Post('confirm-account')
  async confirmAccount(
    @Body() confirmDTO: ConfirmAccountDTO,
    @Session() session: Record<string, any>,
  ) {
    return await this.authService.confirmAccount(confirmDTO, session);
  }

  // Login
  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.login(loginDto);
  }

  // OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Res() res: any, @Req() req: any) {
    try {
      const userData: {
        statusCode: number;
        accessToken?: string;
        providerError?: boolean;
        banError?: boolean;
      } = req.user;

      if (!userData) {
        return res.redirect(
          `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true`,
        );
      }

      if (userData.providerError) {
        return res.redirect(
          `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true&providerError=true`,
        );
      }

      if (userData.banError) {
        return res.redirect(
          `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true&banError=true`,
        );
      }

      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login?access_token=${userData.accessToken}`,
      );
    } catch (error) {
      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true`,
      );
    }
  }

  // Logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any, @Session() session: Record<string, any>) {
    return await this.authService.logout(req, session);
  }
}
