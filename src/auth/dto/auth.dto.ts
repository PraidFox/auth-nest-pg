import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/user.dto';
import { MyError } from '../../utils/constants/errors';
import { IsPasswordMatching } from '../../utils/decorators/same-passwords.decorator';

export class RegisterDto extends CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REPEAT_REQUIRED })
  @MinLength(6)
  @Validate(IsPasswordMatching)
  passwordRepeat: string;
}
export class AuthDto {
  @ApiProperty()
  @IsString()
  emailOrLogin: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class PasswordResetDto {
  @ApiProperty()
  @IsString()
  emailOrLogin: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REPEAT_REQUIRED })
  @MinLength(6)
  @Validate(IsPasswordMatching)
  passwordRepeat: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REQUIRED })
  @MinLength(6)
  password: string;
}
