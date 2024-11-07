import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MyError } from '../../utils/constants/errors';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.USER_NAME_REQUIRED })
  login: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: MyError.EMAIL_REQUIRED })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.PASSWORD_REQUIRED })
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  login: string;
}
