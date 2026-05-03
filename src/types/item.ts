export interface Item {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  countryCode: string;
  userId: string;
  createdAt?: Date;
}
