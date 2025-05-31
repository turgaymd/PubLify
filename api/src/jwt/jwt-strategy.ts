import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload';
import { SupabaseService } from '../supabase/supabase.service';
import { IUser } from '../interfaces/user.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    const secretOrKey = configService.get<string>('JWT_ACCESS_SECRET_KEY')!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;

    if (!id) {
      return new UnauthorizedException({
        success: false,
        error: 'User not found or invalid token',
      });
    }

    const { data: user } = (await this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single()) as { data: IUser };

    if (!user) {
      return new UnauthorizedException({
        statusCode: 404,
        error: 'User not found or invalid token',
      });
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }
}
