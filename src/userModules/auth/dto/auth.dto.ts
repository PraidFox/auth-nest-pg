import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AuthUserResponseDto {
  @IsString()
  login: string;

  @IsString()
  email: string;

  @IsString()
  token: string;
}
