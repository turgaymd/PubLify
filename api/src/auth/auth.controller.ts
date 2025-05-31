import { Body, Controller, Post, Session } from '@nestjs/common';

// Services
import { AuthService } from './auth.service';

// DTOs
import { SignupDTO } from '../user/dto/createUser.dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO } from './dto/login-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.login(loginDto);
  }
}
