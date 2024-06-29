import { FinalProduct } from './FinalProduct';
import { Note } from './Note';
import { User } from './User';

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
