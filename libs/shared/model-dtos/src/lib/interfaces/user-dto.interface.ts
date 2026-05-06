export interface IUserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  balanceInRat: string;
  wallets?: []; // TODO: Define the structure of wallet objects
}
