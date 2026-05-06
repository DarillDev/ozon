import { IUser } from '../models/interfaces/user.interface';

const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me', 'icloud.com'];
const SEXES: IUser['sex'][] = ['male', 'female'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generateUser(index: number): IUser {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const sex = randomItem(SEXES);
  const createdAt = randomDate(new Date('2020-01-01'), new Date());
  const lastSignInAt = randomDate(createdAt, new Date());
  const balanceRat = randomInt(0, 1_000_000);

  return {
    id: generateId(),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${randomItem(DOMAINS)}`,
    age: randomInt(18, 65),
    sex,
    createdAt,
    lastSignInAt,
    isActive: Math.random() > 0.2,
    balanceInRat: balanceRat.toString(),
  };
}

export function generateMockUsers(count: number): IUser[] {
  return Array.from({ length: count }, (_, i) => generateUser(i));
}
