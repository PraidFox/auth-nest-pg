import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserExistsConstraint } from '../../utils/decorators/user-exists.decorator';

export class VerifyEmailQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UrlVerifyEmail {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  urlVerifyEmail: string;
}

export class ResetPassword {
  @ApiProperty()
  @IsString()
  @Validate(UserExistsConstraint)
  emailOrLogin: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  urlVerifyResetPassword: string;
}
