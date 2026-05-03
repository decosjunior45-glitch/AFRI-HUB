export interface User {
  _id?: string;
  email: string;
  password: string;
  countryCode: string;
  createdAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    countryCode: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  countryCode: string;
}
