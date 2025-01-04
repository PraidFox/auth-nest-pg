import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MyError } from '../../utils/constants/errors';
import { IsPasswordMatching } from '../../utils/decorators/same-passwords.decorator';
import { CreateUserDto } from '../../users/dto/user.dto';
import { UserExistsConstraint } from '../../utils/decorators/user-exists.decorator';

export class RegisterDto extends CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REPEAT_REQUIRED })
  @MinLength(6)
  @Validate(IsPasswordMatching)
  passwordRepeat: string;
}

export class AuthDto {
  @ApiProperty({ example: 'Мыло или логин' })
  @IsString()
  emailOrLogin: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class EmailOrLoginDto {
  @ApiProperty()
  @IsString()
  @Validate(UserExistsConstraint)
  emailOrLogin: string;
}

export class PasswordResetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REQUIRED })
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REPEAT_REQUIRED })
  @MinLength(6)
  @Validate(IsPasswordMatching)
  passwordRepeat: string;
}

export class PasswordChangeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REQUIRED })
  @MinLength(6)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.NEW_PASSWORD_REQUIRED })
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REPEAT_REQUIRED })
  @MinLength(6)
  @Validate(IsPasswordMatching)
  passwordRepeat: string;
}

export interface InfoUserInToken {
  id: number;
  login: string;
}
