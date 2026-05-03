export interface Item {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  countryCode: string;
  userId: string;
  createdAt?: string;
}

export interface User {
  _id: string;
  email: string;
  countryCode: string;
}

export interface Country {
  _id: string;
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
