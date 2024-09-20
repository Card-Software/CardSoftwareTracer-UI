import { FinalProduct } from './final-product';
import { Note } from './note';
import { User } from './user';

export interface WholeSaleOrder {
  id?: string;
  orderNumber: string;
  description: string;
  notes: Note[];
  assignedUser: User;
  client: string;
  finalProducts: FinalProduct[]; // this will have the final products that are being ordered
  dateCreated: Date;
}
