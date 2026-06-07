export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Stored locally (mock database)
  avatarColor: string;
  balance: number;
  loyaltyPoints: number;
  joinedDate: string;
}

export type CategoryType = 'coffee' | 'tea' | 'pastries' | 'food' | 'flowers' | 'garden-special';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  price: number;
  emoji: string; // Cozy emoji representation
  isNew?: boolean;
  isPopular?: boolean;
  isEcoFriendly?: boolean;
}

export type SizeOption = 'Small' | 'Medium' | 'Large';
export type SweetnessOption = '0%' | '25%' | '50%' | '100%';
export type MilkOption = 'None' | 'Oat Milk' | 'Cow Milk' | 'Almond Milk' | 'Soy Milk';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  size: SizeOption;
  sweetness: SweetnessOption;
  milk: MilkOption;
  additionalNotes?: string;
}

export type OrderStatus = 'placed' | 'grinding' | 'brewing' | 'topping' | 'ready' | 'completed';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryMethod: 'Pickup' | 'Table Dine-in';
  tableNumber?: string;
  estimatedPrepTime: number; // in seconds remaining
  pointsEarned: number;
}

export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  avatarColor: string;
}
