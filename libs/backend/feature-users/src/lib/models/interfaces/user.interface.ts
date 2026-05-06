export interface IUser {
  id: string;
  name: string;
  email: string;
  age: number;
  sex: 'male' | 'female';
  createdAt: Date;
  lastSignInAt: Date;
  isActive: boolean;
  balanceInRat: string;
  wallets?: [];
}
