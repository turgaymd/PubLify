import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

// Services
import { UserService } from '../user/user.service';
import { SupabaseService } from '../supabase/supabase.service';

// Payload
import { JwtPayload } from '../jwt/jwt-payload';

// DTOs & Utils & Enums
import { SignupDTO } from '../user/dto/createUser.dto';
import { generate_confirm_code } from './utils/generate-codes';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { signup_confirm_message } from './utils/messages/signup-confirm';
import { LoginDTO } from './dto/login-dto';
import { Provider } from '../enums/provider.enum';
import {
  ForgotPasswordDTO,
  SetNewPasswordDTO,
} from './dto/forgot-password-dto';
import {
  emailNotFoundMessage,
  forgotPasswordMessage,
  googleSignInMessage,
} from './utils/messages/forgot-password-message';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  async signup(
    signupDto: SignupDTO,
    session: Record<string, any>,
  ): Promise<{ statusCode: number }> {
    const { full_name, username, email, password, confirm } = signupDto;

    try {
      const isUsernameExist =
        await this.userService.getUserByUsername(username);

      if (isUsernameExist) {
        throw new ConflictException('Username already taken.');
      }

      const isEmailExist = await this.userService.getUserByEmail(email);

      if (isEmailExist) {
        throw new ConflictException('Email already registered.');
      }

      if (password !== confirm) {
        throw new ConflictException(
          'Password and confirm password do not match.',
        );
      }

      const generateCode = generate_confirm_code();

      await this.mailService.sendMail({
        from: '"Publify Team" <publify.team@gmail.com>',
        sender: 'Publify Team',
        to: email,
        subject: 'Confirm your account',
        html: signup_confirm_message(full_name, generateCode),
      });

      session.confirmCode = generateCode;
      session.unconfirmedUser = {
        full_name,
        username,
        email,
        password,
      };

      return {
        statusCode: 200,
      };
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (signup): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when creating user.',
      );
    }
  }

  async confirmAccount(
    confirmDTO: ConfirmAccountDTO,
    session: Record<string, any>,
  ): Promise<{
    statusCode: number;
    user: { id: string; full_name: string; username: string; email: string };
    accessToken: string;
  }> {
    try {
      const { code } = confirmDTO;
      const { confirmCode, unconfirmedUser } = session;

      if (!confirmCode || confirmCode !== code) {
        throw new ConflictException('Invalid confirmation code.');
      }

      if (!unconfirmedUser) {
        throw new ConflictException('Unconfirmed user not found.');
      }

      const { full_name, username, email, password } = unconfirmedUser;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await this.userService.createUser({
        full_name,
        username,
        email,
        password: hashedPassword,
      });

      delete session.unconfirmed_user;
      delete session.confirm_code;

      const payload: JwtPayload = {
        id: newUser.id,
        is_banned: newUser.is_banned,
        username: newUser.username,
      };

      const accessToken = jwt.sign(
        payload,
        this.configService.get<string>('JWT_ACCESS_SECRET_KEY')!,
        {
          expiresIn: '7d',
        },
      );

      return {
        statusCode: 201,
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          username: newUser.username,
          email: newUser.email,
        },
        accessToken,
      };
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (confirmAccount): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when creating user.',
      );
    }
  }

  // Login
  async login(
    loginDto: LoginDTO,
  ): Promise<{ statusCode: number; accessToken: string }> {
    const { username_or_email, password } = loginDto;

    try {
      const isUserExist =
        (await this.userService.getUserByEmail(username_or_email)) ||
        (await this.userService.getUserByUsername(username_or_email));

      if (!isUserExist) {
        throw new NotFoundException({
          statusCode: 404,
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        isUserExist.password,
      );

      if (!isPasswordMatch) {
        throw new NotFoundException({
          statusCode: 404,
        });
      }

      if (isUserExist.is_banned) {
        throw new NotFoundException({
          statusCode: 401,
          error: 'Your account has been banned.',
        });
      }

      const payload: JwtPayload = {
        id: isUserExist.id,
        is_banned: isUserExist.is_banned,
        username: isUserExist.username,
      };

      const accessToken = jwt.sign(
        payload,
        this.configService.get<string>('JWT_ACCESS_SECRET_KEY')!,
        {
          expiresIn: '7d',
        },
      );

      return {
        statusCode: 200,
        accessToken,
      };
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (login): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when logging in.',
      );
    }
  }

  // OAuth
  async validateGoogleUser(user: {
    email: string;
    full_name: string;
    accessToken: string;
  }): Promise<{
    statusCode: number;
    accessToken?: string;
    providerError?: boolean;
    banError?: boolean;
  }> {
    try {
      let existUser = await this.userService.getUserByEmail(user.email);

      if (!existUser) {
        const newUser = await this.userService.createUser({
          full_name: user.full_name,
          username: this.generateUsername(user.full_name),
          email: user.email,
          password: 'signed_up_with_google',
          provider: Provider.GOOGLE,
        });

        existUser = newUser;
      }

      if (existUser.provider === Provider.NORMAL) {
        return {
          statusCode: 400,
          providerError: true,
        };
      }

      if (existUser.is_banned) {
        return {
          statusCode: 401,
          banError: true,
        };
      }

      return { statusCode: 200, accessToken: user.accessToken };
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (OAuth login): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when logging in.',
      );
    }
  }

  private generateUsername(full_name: string): string {
    const split_name = full_name.toLowerCase().replaceAll(' ', '_');
    if (split_name.includes('.')) {
      return `${split_name.split('.')[0]}_${uuid().slice(0, 5)}`;
    }
    return `${split_name}_${uuid().slice(0, 5)}`;
  }

  // Logout
  async logout(
    req: any,
    session: Record<string, any>,
  ): Promise<{ statusCode: number }> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new NotFoundException({
          statusCode: 404,
        });
      }

      await this.supabase
        .getClient()
        .from('token_black_list')
        .insert({ token });

      await session.destroy();

      return { statusCode: 200 };
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (logout): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when logging out.',
      );
    }
  }

  // Forgot Password
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDTO,
  ): Promise<{ statusCode: number }> {
    try {
      const { email } = forgotPasswordDto;

      const user = await this.userService.getUserByEmail(email);

      // If user is not exist
      if (!user) {
        await this.mailService.sendMail({
          from: '"Publify Team" <publify.team@gmail.com>',
          sender: 'Publify Team',
          to: email,
          subject: 'Password Reset - Account could not be found',
          html: emailNotFoundMessage(email),
        });
      }

      // If User has signed by google
      else if (user.provider === Provider.GOOGLE) {
        await this.mailService.sendMail({
          from: '"Publify Team" <publify.team@gmail.com>',
          sender: 'Publify Team',
          to: email,
          subject: 'Password Reset - Account provided by Google',
          html: googleSignInMessage(email),
        });
      }

      // If user already exist
      else {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiration = new Date(Date.now() + 3600000);

        await this.userService.updateResetToken(
          email,
          resetToken,
          resetTokenExpiration,
        );

        await this.mailService.sendMail({
          from: '"Publify Team" <publify.team@gmail.com>',
          sender: 'Publify Team',
          to: email,
          subject: 'Password Reset - Publify',
          html: forgotPasswordMessage(resetToken),
        });
      }
      this.logger.log(`New password reset message has been sent to ${email}`);

      return { statusCode: 200 };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error when sent forgot password request.',
      );
    }
  }

  // Check reset token
  async isResetTokenValid(
    resetToken: string,
  ): Promise<{ isTokenValid: boolean }> {
    try {
      const user = await this.userService.getUserByResetToken(resetToken);

      return !user || !user.resetToken || user.resetTokenExpiration < new Date()
        ? { isTokenValid: false }
        : { isTokenValid: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error when checking reset token.',
      );
    }
  }

  // Reset Password
  async resetPassword(
    newPasswordDto: SetNewPasswordDTO,
    resetToken: string,
  ): Promise<{ statusCode: number }> {
    try {
      const { password, confirm } = newPasswordDto;

      if (!resetToken) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Reset token is required.',
        });
      }

      const user = await this.userService.getUserByResetToken(resetToken);

      if (!user) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Invalid Token.',
        });
      }

      if (user.resetTokenExpiration < new Date()) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Token has expired.',
        });
      }

      if (password !== confirm) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Passwords do not match.',
        });
      }

      const isPasswordSame = await bcrypt.compare(password, user.password);

      if (isPasswordSame) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'New password cannot be same as old password.',
        });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userService.updatePassword(user.id, hashedPassword);
      await this.userService.updateResetToken(user.email, null, null);

      this.logger.log(`Password has been reset for ${user.email}`);

      return { statusCode: 200 };
    } catch (error) {
      console.log(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error when reset password.',
      );
    }
  }
}
