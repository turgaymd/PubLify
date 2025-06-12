// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

// Services
import { SupabaseService } from '../supabase/supabase.service';

// Interfaces & DTOs
import { INewUser, IUser } from '../interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // Get User
  async getUserByUsername(username: string): Promise<IUser> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(
          `Supabase error (getUserByUsername): ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Something went wrong when getting user.',
        );
      }

      return data;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (getUserByUsername): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when getting user.',
      );
    }
  }

  async getUserByEmail(email: string): Promise<IUser> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Supabase error (getUserByEmail): ${error.message}`);
        throw new InternalServerErrorException(
          'Something went wrong when getting user.',
        );
      }

      return data;
    } catch (err) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      this.logger.error(`Unknown error (getUserByEmail): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when getting user.',
      );
    }
  }

  async getUserByResetToken(resetToken: string): Promise<IUser> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .select('*')
        .eq('resetToken', resetToken)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Supabase error (getUserByEmail): ${error.message}`);
        throw new InternalServerErrorException(
          'Something went wrong when getting user.',
        );
      }

      return data;
    } catch (err) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      this.logger.error(`Unknown error (getUserByToken): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when getting user.',
      );
    }
  }

  // Create New User
  async createUser(newUser: INewUser): Promise<IUser> {
    try {
      const { data: insertedUser, error: insertError } = await this.supabase
        .getClient()
        .from('users')
        .insert({
          full_name: newUser.full_name,
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          provider: newUser.provider,
        })
        .select('*')
        .single();

      if (insertError) {
        this.logger.error(
          `Supabase error (insert user): ${insertError.message}`,
        );
        throw new InternalServerErrorException(
          'Internal server error when creating user.',
        );
      }

      if (!insertedUser) {
        throw new InternalServerErrorException('Could not create user.');
      }

      return insertedUser;
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      this.logger.error(`Unknown error (createUser): ${err}`);
      throw new InternalServerErrorException(
        'Internal server error when creating user.',
      );
    }
  }

  // Update User Informations
  async updateResetToken(
    email: string,
    resetToken: string | null,
    resetTokenExpiration: Date | null,
  ): Promise<void> {
    try {
      await this.supabase
        .getClient()
        .from('users')
        .update({
          resetToken,
          resetTokenExpiration,
        })
        .eq('email', email)
        .single();
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
      });
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      await this.supabase
        .getClient()
        .from('users')
        .update({ password: newPassword })
        .eq('id', id)
        .single();
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
      });
    }
  }
}
