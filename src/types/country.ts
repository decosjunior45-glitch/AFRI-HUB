export interface Country {
  _id?: string;
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface Link {
  _id?: string;
  countryCode: string;
  title: string;
  url: string;
  description?: string;
}
