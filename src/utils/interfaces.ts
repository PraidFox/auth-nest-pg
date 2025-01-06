export interface DataAccessToken {
  id: number;
  login: string;
}

export interface DataRefreshToken extends DataAccessToken {
  uuidSession: string;
}

export interface DataAllTokens extends DataRefreshToken {}

export interface DecodedAccessToken extends DataAccessToken {
  exp: number;
  iat: number;
}

export interface DecodedRefreshToken extends DecodedAccessToken {
  uuidSession: string;
}
