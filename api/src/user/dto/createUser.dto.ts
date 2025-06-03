import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDTO {
  @IsString({ message: 'Name must be string' })
  @IsNotEmpty({ message: 'Name field can not be empty' })
  @MinLength(1, { message: 'Name length must be minimum 1' })
  @MaxLength(255, { message: 'Name length must be smaller that 255' })
  full_name: string;

  @IsString({ message: 'Username must be string' })
  @IsNotEmpty({ message: 'Username field can not be empty' })
  @MinLength(3, { message: 'Username length must be minimum 3' })
  @MaxLength(255, { message: 'Username length must be smaller that 255' })
  @Matches(/^[^\s.,?()$:;"'{}[\]=+&!\\|/<>`~@#№%^]+$/, {
    message:
      'Username can not contain spaces or special characters like (.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^) ',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email field can not be empty' })
  @MinLength(8, { message: 'Email length must be minimum 8' })
  @MaxLength(255, { message: 'Email length must be smaller that 255' })
  email: string;

  @IsNotEmpty({ message: 'Password field can not be empty' })
  @IsString({ message: 'Password must be string' })
  @MinLength(8, { message: 'Password must have minimum 8 character' })
  @MaxLength(255, { message: 'Password can be maxmimum 255 character length' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>'№_;:/-])[A-Za-z\d@$!%*?&]{8,15}$/,
    {
      message:
        'Password must be minimum 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'Confirm password field can not be empty' })
  @IsString({ message: 'Confirm password must be string' })
  @Type(() => String)
  confirm: string;
}
