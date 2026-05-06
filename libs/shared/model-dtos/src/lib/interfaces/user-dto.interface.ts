export interface IUserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  balanceInRat: string;
  isActive: boolean;
  sex: 'male' | 'female';
  wallets?: []; // TODO: Define the structure of wallet objects
}
