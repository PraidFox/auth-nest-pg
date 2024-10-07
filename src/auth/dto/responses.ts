import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty()
  id: number;
}

export class VerifyResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  verified: boolean;
}

export class MessageResponse {
  @ApiProperty()
  message: string;
}

export class TokenResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expire: Date;
}
