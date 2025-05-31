import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from 'src/user/dto/createUser.dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';

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
}
