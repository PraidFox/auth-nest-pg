import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { MyError } from '../../utils/constants/errors';

export class TstEmailSent {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: MyError.EMAIL_REQUIRED })
  to: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: MyError.SUBJECT_REQUIRED })
  subject: string;
}
