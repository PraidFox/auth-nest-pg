import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
