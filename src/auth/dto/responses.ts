import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty()
  id: number;
}

export class TokenResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expire: Date;
}
