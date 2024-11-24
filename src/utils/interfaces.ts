export interface DataAccessToken {
  id: number;
  login: string;
}

export interface DataRefreshToken extends DataAccessToken {
  uuidSession: string;
}

export interface DataAllTokens extends DataRefreshToken {}
