import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailQuery {
  @IsString()
  @IsNotEmpty()
  token: string;
}
