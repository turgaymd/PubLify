import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

// Services
import { UserService } from '../user/user.service';

// Payload
import { JwtPayload } from '../jwt/jwt-payload';

// DTOs and Utils
import { SignupDTO } from '../user/dto/createUser.dto';
import { generate_confirm_code } from './utils/generate-codes';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { signup_confirm_message } from './utils/messages/signup-confirm';
import { LoginDTO } from './dto/login-dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
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
  async login(loginDto: LoginDTO): Promise<{ statusCode: number; accessToken: string }> {
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
}
