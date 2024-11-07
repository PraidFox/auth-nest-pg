import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SessionDto {
  @ApiProperty()
  @IsString()
  userId: number;

  @ApiProperty()
  @IsString()
  sessionMetadata: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;
}
